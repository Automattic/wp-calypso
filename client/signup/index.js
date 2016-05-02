/**
 * External dependencies
 */
var page = require( 'page' );

/**
 * Internal dependencies
 */
var controller = require( './controller' ),
	jetpackConnectController = require( './jetpack-connect/controller' ),
	adTracking = require( 'lib/analytics/ad-tracking' ),
	config = require( 'config' );

module.exports = function() {
	if ( config.isEnabled( 'phone_signup' ) ) {
		page( '/phone/:lang?', controller.phoneSignup );
	}

	page(
		'/start/:flowName?/:stepName?/:stepSectionName?/:lang?',
		adTracking.retarget,
		controller.saveRefParameter,
		controller.saveQueryObject,
		controller.redirectWithoutLocaleIfLoggedIn,
		controller.redirectToFlow,
		controller.start
	);

	if ( config.isEnabled( 'login' ) ) {
		page( '/log-in/:lang?', controller.login );
	}

	if ( config.isEnabled( 'jetpack/connect' ) ) {
		page( '/jetpack/connect', jetpackConnectController.connect );
		page(
			'/jetpack/connect/authorize',
			jetpackConnectController.saveQueryObject,
			jetpackConnectController.authorizeForm
		);
	}

	if ( config.isEnabled( 'jetpack/sso' ) ) {
		page( '/jetpack/sso', jetpackConnectController.saveQueryObject, jetpackConnectController.sso );
	}
};
