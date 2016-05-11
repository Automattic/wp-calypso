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
		page(
			'/jetpack/connect/authorize/:locale?',
			jetpackConnectController.redirectWithoutLocaleifLoggedIn,
			jetpackConnectController.saveQueryObject,
			jetpackConnectController.authorizeForm
		);

		page(
			'/jetpack/connect/:locale?',
			jetpackConnectController.redirectWithoutLocaleifLoggedIn,
			jetpackConnectController.connect
		);
	}

	if ( config.isEnabled( 'jetpack/sso' ) ) {
		page( '/jetpack/sso', jetpackConnectController.saveQueryObject, jetpackConnectController.sso );
	}
};
