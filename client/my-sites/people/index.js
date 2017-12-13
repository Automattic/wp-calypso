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
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	if ( config.isEnabled( 'manage/people' ) ) {
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
			'/people/new/:site_id',
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
		page(
			'/people/(.*)?',
			siteSelection,
			peopleController.redirectToTeam,
			makeLayout,
			clientRender
		);
	}
}
