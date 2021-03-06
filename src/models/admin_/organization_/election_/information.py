"""
Back end for election panel information.
"""

__author__ = 'Waseem Ahmad <waseem@rice.edu>'

import json
import logging
import webapp2

from authentication import auth
from datetime import datetime, timedelta
from google.appengine.api import taskqueue
from models import models, webapputils, report_results
from models.admin_.organization_.election import get_panel

PAGE_URL = '/admin/organization/election/information'
TASK_URL = '/tasks/admin/organization/election/information'

class ElectionInformationHandler(webapp2.RequestHandler):

    def get(self):
        # Authenticate user
        voter = auth.get_voter(self)
        status = models.get_admin_status(voter)
        if not status:
            webapputils.render_page(self, '/templates/message', 
                {'status': 'Error', 'msg': 'Not Authorized'})
            return
        
        data = {}

        # Get election
        election = auth.get_election()
        if election:
            data = {'id': str(election.key()),
                    'election': election.to_json()}
        panel = get_panel(PAGE_URL, data, data.get('id'))
        webapputils.render_page_content(self, PAGE_URL, panel)

    def post(self):
        methods = {
            'get_election': self.get_election,
            'update_election': self.update_election
        }

        # Authenticate user
        org = auth.get_organization()
        if not org:
            webapputils.respond(self, 'ERROR', 'Not Authorized')
            return

        # Get election
        election = auth.get_election()

        # Get the method
        data = json.loads(self.request.get('data'))
        method = data['method']
        logging.info('Method: %s\n Data: %s', method, data)
        if method in methods:
            methods[method](election, data)
        else:
            webapputils.respond(self, 'ERROR', 'Unkown method')

    def get_election(self, election, data):
        out = {'status': 'OK'}
        if election:
            out['election'] = election.to_json()
        self.response.write(json.dumps(out))

    def update_election(self, election, data):
        out = {'status': 'OK'}
        if not election:
            # User must be trying to create new election
            election = models.Election(
                name=data['name'],
                start=datetime.fromtimestamp(data['times']['start']),
                end=datetime.fromtimestamp(data['times']['end']),
                organization=auth.get_organization(),
                universal=data['universal'],
                hidden=data['hidden'],
                result_delay=data['result_delay'],
                description=data['description'])
            election.put()
            out['msg'] = 'Created'
            auth.set_election(election)
        else:
            election.name = data['name']
            election.start = datetime.fromtimestamp(data['times']['start'])
            election.end = datetime.fromtimestamp(data['times']['end'])
            election.universal = data['universal']
            election.hidden = data['hidden']
            election.result_delay = data['result_delay']
            election.description = data['description']
            election.put()
            out['msg'] = 'Updated'
        self.schedule_result_computation(election)
        out['election'] = election.to_json()
        self.response.write(json.dumps(out))

    def schedule_result_computation(self, election):
        method_name = "compute_results"
        old_task_name = '-'.join(
            [str(election.key()), str(election.task_count), method_name])
        election.task_count += 1
        task_name = '-'.join(
            [str(election.key()), str(election.task_count), method_name])

        # Delete any existing tasks enqueued for computing results
        q = taskqueue.Queue()
        q.delete_tasks(taskqueue.Task(name=old_task_name))

        # Enqueue new task for computing results after election ends
        compute_time = election.end + timedelta(seconds=5)
        data = {'election_key': str(election.key()),
                'method': method_name}
        retry_options = taskqueue.TaskRetryOptions(task_retry_limit=0)
        taskqueue.add(name=task_name,
                      url=TASK_URL,
                      params={'data': json.dumps(data)},
                      eta=compute_time,
                      retry_options=retry_options)
        election.put()
        logging.info('Election result computation enqueued.')
        
