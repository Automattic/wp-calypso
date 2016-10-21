/**
 * External dependencies
 */
var page = require( 'page' );

/**
 * Internal dependencies
 */
var controller = require( 'my-sites/controller' ),
	config = require( 'config' ),
	peopleController = require( './controller' );

module.exports = function() {
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

		if ( config.isEnabled( 'manage/people/role-filtering' ) ) {
			[ 'administrators', 'editors', 'authors', 'contributors' ].forEach( function( filter ) {
				page(
					'/people/' + filter + '/:site_id',
					peopleController.enforceSiteEnding,
					controller.siteSelection,
					controller.navigation,
					peopleController.people.bind( null, filter )
				);
			} );
		}

		if ( config.isEnabled( 'manage/add-people' ) ) {
			page(
				'/people/new/:site_id',
				peopleController.enforceSiteEnding,
				controller.siteSelection,
				controller.navigation,
				peopleController.invitePeople
			);
		}

		page(
			'/people/edit/:user_login/:site_id',
			peopleController.enforceSiteEnding,
			controller.siteSelection,
			controller.navigation,
			peopleController.person
		);

		// Anything else is unexpected and should be redirected to the default people management URL: /people/team
		page( '/people/(.*)?', controller.siteSelection, peopleController.redirectToTeam );
	}
};
