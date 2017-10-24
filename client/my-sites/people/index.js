/**
 * External dependencies
 *
 * @format
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { siteSelection, sites, navigation } from 'my-sites/controller';
import config from 'config';
import peopleController from './controller';

export default function() {
	if ( config.isEnabled( 'manage/people' ) ) {
		[ 'team', 'followers', 'email-followers', 'viewers' ].forEach( function( filter ) {
			page( '/people/' + filter, siteSelection, sites );
			page(
				'/people/' + filter + '/:site_id',
				peopleController.enforceSiteEnding,
				siteSelection,
				navigation,
				peopleController.people.bind( null, filter )
			);
		} );

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
