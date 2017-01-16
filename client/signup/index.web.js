/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import jetpackConnectController from './jetpack-connect/controller';
import sitesController from 'my-sites/controller';

export default function() {
	page(
		'/start/:flowName?/:stepName?/:stepSectionName?/:lang?',
		controller.saveRefParameter,
		controller.saveQueryObject,
		controller.redirectWithoutLocaleIfLoggedIn,
		controller.redirectToFlow,
		controller.start
	);

	page( '/jetpack/connect/install', jetpackConnectController.install );

	page( '/jetpack/connect/personal', jetpackConnectController.personal );
	page( '/jetpack/connect/personal/:intervalType', jetpackConnectController.personal );

	page( '/jetpack/connect/premium', jetpackConnectController.premium );
	page( '/jetpack/connect/premium/:intervalType', jetpackConnectController.premium );

	page( '/jetpack/connect/pro', jetpackConnectController.pro );
	page( '/jetpack/connect/pro/:intervalType', jetpackConnectController.pro );

	page( '/jetpack/connect', jetpackConnectController.connect );

	page( '/jetpack/connect/choose/:site', jetpackConnectController.plansPreSelection );

	page(
		'/jetpack/connect/authorize/:localeOrInterval?',
		jetpackConnectController.redirectWithoutLocaleifLoggedIn,
		jetpackConnectController.saveQueryObject,
		jetpackConnectController.authorizeForm
	);

	page(
		'/jetpack/connect/authorize/:intervalType/:locale',
		jetpackConnectController.redirectWithoutLocaleifLoggedIn,
		jetpackConnectController.saveQueryObject,
		jetpackConnectController.authorizeForm
	);

	page(
		'/jetpack/connect/install/:locale?',
		jetpackConnectController.redirectWithoutLocaleifLoggedIn,
		jetpackConnectController.install
	);

	page( '/jetpack/connect/store', jetpackConnectController.plansLanding );
	page( '/jetpack/connect/store/:intervalType', jetpackConnectController.plansLanding );

	page( '/jetpack/connect/vaultpress', jetpackConnectController.vaultpressLanding );
	page( '/jetpack/connect/vaultpress/:intervalType', jetpackConnectController.vaultpressLanding );

	page( '/jetpack/connect/akismet', jetpackConnectController.akismetLanding );
	page( '/jetpack/connect/akismet/:intervalType', jetpackConnectController.akismetLanding );

	page(
		'/jetpack/connect/:locale?',
		jetpackConnectController.redirectWithoutLocaleifLoggedIn,
		jetpackConnectController.connect
	);

	page(
		'/jetpack/connect/plans/:site',
		sitesController.siteSelection,
		jetpackConnectController.plansSelection
	);

	page(
		'/jetpack/connect/plans/:intervalType/:site',
		sitesController.siteSelection,
		jetpackConnectController.plansSelection
	);

	page( '/jetpack/sso/:siteId?/:ssoNonce?', jetpackConnectController.sso );
	page( '/jetpack/sso/*', jetpackConnectController.sso );
	page( '/jetpack/new', jetpackConnectController.newSite );
}
