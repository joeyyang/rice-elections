"""
Back end for election panel positions.
"""

__author__ = 'Waseem Ahmad <waseem@rice.edu>'

import json
import logging
import webapp2

from authentication import auth
from models import models
from models.webapputils import render_template
from models.webapputils import json_response
from models.admin_.organization_.election import get_panel

PAGE_URL = '/admin/organization/election/positions'


class ElectionPositionsHandler(webapp2.RequestHandler):

    def get(self):
        # Authenticate user
        voter = auth.get_voter(self)
        status = models.get_admin_status(voter)
        if not status:
            return render_template('/templates/message',
                {'status': 'ERROR', 'msg': 'Not Authorized'})

        # Get election
        election = auth.get_election()
        if not election:
            return get_panel(
                PAGE_URL,
                {'status': 'ERROR','msg': 'No election found.'},
                None)

        data = {'status': 'OK',
                'id': str(election.key()),
                'election': election.to_json()}
        return get_panel(PAGE_URL, data, data.get('id'))

    def post(self):
        methods = {
            'get_positions': self.get_positions,
            'add_position': self.add_position,
            'get_position': self.get_position,
            'update_position': self.update_position,
            'delete_position': self.delete_position
        }

        # Get election
        election = auth.get_election()
        logging.info('Election: %s\n', election.name)
        if not election:
            return

        # Get the method
        data = json.loads(self.request.get('data'))
        method = data['method']
        logging.info('Method: %s\n Data: %s', method, data)
        if method in methods:
            methods[method](election, data)
        else:
            return json_response('ERROR', 'Unknown method')

    def get_positions(self, election, data):
        out = {'positions': [p.to_json() for p in election.election_positions]}
        self.response.write(json.dumps(out))

    def add_position(self, election, data):
        position = data['position']
        position_entry = models.get_position(position['name'],
                                             election.organization,
                                             create=True)

        # Store position
        if position['type'] == 'Ranked-Choice':
            ep = models.RankedVotingPosition(
                election=election,
                position=position_entry,
                vote_required=position['vote_required'],
                write_in_slots=position['write_in_slots'])
            ep.put()
        elif position['type'] == 'Cumulative-Voting':
            ep = models.CumulativeVotingPosition(
                election=election,
                position=position_entry,
                vote_required=position['vote_required'],
                write_in_slots=position['write_in_slots'],
                points=position['points'],
                slots=position['slots'])
            ep.put()

        # Store candidates
        for candidate in position['candidates']:
            models.ElectionPositionCandidate(
                election_position=ep,
                name=candidate['name']).put()

        out = {'status': 'OK',
               'msg': 'Created',
               'position': ep.to_json()}
        self.response.write(json.dumps(out))

    def get_position(self, election, data):
        ep = models.ElectionPosition.get(data['id'])
        if ep:
            self.response.write(json.dumps({'position': ep.to_json()}))
            logging.info(ep.to_json())
        else:
            return json_response('ERROR', 'Not found')

    def update_position(self, election, data):
        logging.info("Election: ", election)
        logging.info("Data: ", data)
        return json_response('ERROR', 'Feature not available')

    def delete_position(self, election, data):
        ep = models.ElectionPosition.get(data['id'])
        if ep:
            for epc in ep.election_position_candidates:
                epc.delete()
            ep.delete()
            return json_response('OK', 'Deleted')
        else:
            return json_response('ERROR', 'Not found')

