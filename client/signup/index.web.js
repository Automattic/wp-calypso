/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import jetpackConnectController from './jetpack-connect/controller';
import config from 'config';
import sitesController from 'my-sites/controller';

module.exports = function() {
	page(
		'/start/:flowName?/:stepName?/:stepSectionName?/:lang?',
		controller.saveRefParameter,
		controller.saveQueryObject,
		controller.redirectWithoutLocaleIfLoggedIn,
		controller.redirectToFlow,
		controller.start
	);

	if ( config.isEnabled( 'jetpack/connect' ) ) {
		page( '/jetpack/connect/install', jetpackConnectController.install );

		page( '/jetpack/connect/premium', jetpackConnectController.premium );

		page( '/jetpack/connect/pro', jetpackConnectController.pro );

		page( '/jetpack/connect', jetpackConnectController.connect );

		page(
			'/jetpack/connect/authorize/:locale?',
			jetpackConnectController.redirectWithoutLocaleifLoggedIn,
			jetpackConnectController.saveQueryObject,
			jetpackConnectController.authorizeForm
		);

		page(
			'/jetpack/connect/install/:locale?',
			jetpackConnectController.redirectWithoutLocaleifLoggedIn,
			jetpackConnectController.install
		);

		page(
			'/jetpack/connect/:locale?',
			jetpackConnectController.redirectWithoutLocaleifLoggedIn,
			jetpackConnectController.connect
		);

		page(
			'/jetpack/connect/plans/:site',
			sitesController.siteSelection,
			jetpackConnectController.plansLanding
		);
	}

	if ( config.isEnabled( 'jetpack/sso' ) ) {
		page( '/jetpack/sso/:siteId?/:ssoNonce?', jetpackConnectController.sso );
		page( '/jetpack/sso/*', jetpackConnectController.sso );
	}
};
