"""
Run once, be happy forever. (Only once!)
If this ends up on Github...
"""

from models import models

def main():
    print "Creating organizations..."

    brown = models.Organization(name='Brown College',
                                description='The best residential college.',
                                website='http://brown.rice.edu')
    brown.put()
    mcmurtry = models.Organization(name='McMurtry College',
                                description='Not the best residential college.',
                                website='http://mcmurtry.rice.edu')
    mcmurtry.put()
    baker = models.Organization(name='Baker College',
                                description='Not the best residential college.',
                                website='http://baker.rice.edu')
    baker.put()

    print "Done."
    print "Creating admins..."

    users = [
        ('wa1', 'wa1@rice.edu'),
        ('apc1', 'apc1@rice.edu'),
        ('jcc7', 'jcc7@rice.edu'),
        ('jbb4', 'jbb4@rice.edu'),
        ('cmp1', 'cmp1@rice.edu')
    ]

    admins = []

    for net_id, email in users:
        voter = models.get_voter(net_id, create=True)
        admin = models.Admin(voter=voter, email=email).put()
        admins.append(admin)


    for admin in admins[:3]:
        models.OrganizationAdmin(admin=admin, organization=brown).put()

    models.OrganizationAdmin(admin=admins[3], organization=mcmurtry).put()
    models.OrganizationAdmin(admin=admins[4], organization=baker).put()

    print "Done."

if __name__ == '__main__':
    main()