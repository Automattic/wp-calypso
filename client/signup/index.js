/**
 * External dependencies
 */
var page = require( 'page' );

/**
 * Internal dependencies
 */
var controller = require( './controller' ),
	jetpackConnectController = require( './jetpack-connect/controller' ),
	adTracking = require( 'analytics/ad-tracking' ),
	config = require( 'config' ),
	Layout = require( 'layout' );

import { makeLayout } from 'controller';

// TODO: temporary, will be replaced with a proper boot/layout middleware
let setLayoutComponent = function( context, next ) {
	context.layoutComponent = Layout;
	next();
};

module.exports = function( router ) {
	if ( config.isEnabled( 'phone_signup' ) ) {
		router( '/phone/:lang?', controller.phoneSignup, setLayoutComponent, makeLayout );
	}

	router(
		'/start/:flowName?/:stepName?/:stepSectionName?/:lang?',
		adTracking.retarget,
		controller.saveRefParameter,
		controller.saveQueryObject,
		controller.redirectWithoutLocaleIfLoggedIn,
		controller.redirectToFlow,
		controller.start,
		setLayoutComponent,
		makeLayout
	);

	if ( config.isEnabled( 'login' ) ) {
		router( '/log-in/:lang?', controller.login, setLayoutComponent, makeLayout );
	}

	if ( config.isEnabled( 'jetpack/calypso-first-signup-flow' ) ) {
		router( '/jetpack/connect', jetpackConnectController.connect, setLayoutComponent, makeLayout );
		router(
			'/jetpack/connect/authorize',
			jetpackConnectController.saveQueryObject,
			jetpackConnectController.authorizeForm,
			setLayoutComponent,
			makeLayout
		);
	}
};
