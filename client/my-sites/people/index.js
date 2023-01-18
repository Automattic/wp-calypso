import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import peopleController from './controller';

export default function () {
	page(
		'/people/:filter(team|followers|email-followers|viewers)',
		siteSelection,
		sites,
		makeLayout,
		clientRender
	);

	page(
		'/people/:filter(team|followers|email-followers|viewers)/:site_id',
		peopleController.enforceSiteEnding,
		siteSelection,
		navigation,
		peopleController.people,
		makeLayout,
		clientRender
	);

	page(
		'/people/:filter(viewers)/:site_id/:user_id',
		peopleController.enforceSiteEnding,
		siteSelection,
		navigation,
		peopleController.viewerTeamMember,
		makeLayout,
		clientRender
	);

	page( '/people/invites', siteSelection, sites, makeLayout, clientRender );

	page(
		'/people/invites/:site_id',
		peopleController.enforceSiteEnding,
		siteSelection,
		navigation,
		peopleController.peopleInvites,
		makeLayout,
		clientRender
	);

	page(
		'/people/invites/:site_id/:invite_key',
		peopleController.enforceSiteEnding,
		siteSelection,
		navigation,
		peopleController.peopleInviteDetails,
		makeLayout,
		clientRender
	);

	page(
		'/people/:filter(subscribers)/:site_id',
		peopleController.enforceSiteEnding,
		siteSelection,
		navigation,
		peopleController.subscribers,
		makeLayout,
		clientRender
	);

	page(
		'/people/:filter(subscribers)/:site_id/:typeId',
		peopleController.enforceSiteEnding,
		siteSelection,
		navigation,
		peopleController.subscriberDetails,
		makeLayout,
		clientRender
	);

	page(
		'/people/add-subscribers/:site_id',
		peopleController.enforceSiteEnding,
		siteSelection,
		navigation,
		peopleController.peopleAddSubscribers,
		makeLayout,
		clientRender
	);

	page(
		'/people/new/:site_id',
		peopleController.enforceSiteEnding,
		siteSelection,
		navigation,
		peopleController.invitePeople,
		makeLayout,
		clientRender
	);

	page(
		'/people/new/:site_id/sent',
		peopleController.enforceSiteEnding,
		siteSelection,
		navigation,
		peopleController.invitePeople,
		makeLayout,
		clientRender
	);

	page(
		'/people/edit/:site_id/:user_login',
		peopleController.enforceSiteEnding,
		siteSelection,
		navigation,
		peopleController.person,
		makeLayout,
		clientRender
	);

	// Anything else is unexpected and should be redirected to the default people management URL: /people/team
	page( '/people/(.*)?', siteSelection, peopleController.redirectToTeam, makeLayout, clientRender );
}
