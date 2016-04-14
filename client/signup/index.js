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
import { addLayoutToContext } from 'boot';

module.exports = function( router ) {
	if ( config.isEnabled( 'phone_signup' ) ) {
		router( '/phone/:lang?', controller.phoneSignup, addLayoutToContext, makeLayout );
	}

	router(
		'/start/:flowName?/:stepName?/:stepSectionName?/:lang?',
		adTracking.retarget,
		controller.saveRefParameter,
		controller.saveQueryObject,
		controller.redirectWithoutLocaleIfLoggedIn,
		controller.redirectToFlow,
		controller.start,
		addLayoutToContext,
		makeLayout
	);

	if ( config.isEnabled( 'login' ) ) {
		router( '/log-in/:lang?', controller.login, addLayoutToContext, makeLayout );
	}

	if ( config.isEnabled( 'jetpack/calypso-first-signup-flow' ) ) {
		router( '/jetpack/connect', jetpackConnectController.connect, addLayoutToContext, makeLayout );
		router(
			'/jetpack/connect/authorize',
			jetpackConnectController.saveQueryObject,
			jetpackConnectController.authorizeForm,
			addLayoutToContext,
			makeLayout
		);
	}
};
