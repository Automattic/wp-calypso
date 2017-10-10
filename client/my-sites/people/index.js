/**
 * External dependencies
 *
 * @format
 */

import page from 'page';

/**
 * Internal dependencies
 */
import controller from 'my-sites/controller';
import config from 'config';
import peopleController from './controller';

export default function() {
	if ( config.isEnabled( 'manage/people' ) ) {
		[ 'team', 'followers', 'email-followers', 'viewers' ].forEach( function( filter ) {
			page( '/people/' + filter, controller.siteSelection, controller.sites );
			page(
				'/people/' + filter + '/:site_id',
				peopleController.enforceSiteEnding,
				controller.siteSelection,
				controller.navigation,
				peopleController.people.bind( null, filter )
			);
		} );

		page(
			'/people/new/:site_id',
			peopleController.enforceSiteEnding,
			controller.siteSelection,
			controller.navigation,
			peopleController.invitePeople
		);

		page(
			'/people/edit/:site_id/:user_login',
			peopleController.enforceSiteEnding,
			controller.siteSelection,
			controller.navigation,
			peopleController.person
		);

		// Anything else is unexpected and should be redirected to the default people management URL: /people/team
		page( '/people/(.*)?', controller.siteSelection, peopleController.redirectToTeam );
	}
};
