/**
 * External dependencies
 */
var page = require( 'page' );

/**
 * Internal dependencies
 */
var controller = require( './controller' ),
	adTracking = require( 'analytics/ad-tracking' ),
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
};
