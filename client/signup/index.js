/**
 * Internal dependencies
 */
var controller = require( './controller' ),
	jetpackConnectController = require( './jetpack-connect/controller' ),
	adTracking = require( 'lib/analytics/ad-tracking' ),
	config = require( 'config' ),
	makeLayout = require( 'controller' ).makeLayout;

module.exports = function( router ) {
	if ( config.isEnabled( 'phone_signup' ) ) {
		router( '/phone/:lang?', controller.phoneSignup, makeLayout );
	}

	router(
		'/start/:flowName?/:stepName?/:stepSectionName?/:lang?',
		adTracking.retarget,
		controller.saveRefParameter,
		controller.saveQueryObject,
		controller.redirectWithoutLocaleIfLoggedIn,
		controller.redirectToFlow,
		controller.start,
		makeLayout
	);

	if ( config.isEnabled( 'login' ) ) {
		router( '/log-in/:lang?', controller.login, makeLayout );
	}

	if ( config.isEnabled( 'jetpack/calypso-first-signup-flow' ) ) {
		router( '/jetpack/connect', jetpackConnectController.connect, makeLayout );
		router(
			'/jetpack/connect/authorize',
			jetpackConnectController.saveQueryObject,
			jetpackConnectController.authorizeForm,
			makeLayout
		);
	}
};
