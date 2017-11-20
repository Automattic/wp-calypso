/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import config from 'config';
import peopleController from './controller';

export default function() {
	if ( config.isEnabled( 'manage/people' ) ) {
		page( '/people/:filter(team|followers|email-followers|viewers)', siteSelection, sites );

		page(
			'/people/:filter(team|followers|email-followers|viewers)/:site_id',
			peopleController.enforceSiteEnding,
			siteSelection,
			navigation,
			peopleController.people
		);

		page(
			'/people/new/:site_id',
			peopleController.enforceSiteEnding,
			siteSelection,
			navigation,
			peopleController.invitePeople
		);

		page(
			'/people/edit/:site_id/:user_login',
			peopleController.enforceSiteEnding,
			siteSelection,
			navigation,
			peopleController.person
		);

		// Anything else is unexpected and should be redirected to the default people management URL: /people/team
		page( '/people/(.*)?', siteSelection, peopleController.redirectToTeam );
	}
}
