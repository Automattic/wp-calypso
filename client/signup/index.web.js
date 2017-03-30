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

import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page(
	    '/start/:flowName?/:stepName?/:stepSectionName?/:lang?',
		controller.saveRefParameter,
		controller.saveQueryObject,
		controller.redirectWithoutLocaleIfLoggedIn,
		controller.redirectToFlow,
		controller.start,
		makeLayout,
		clientRender
	);

	page(
	    '/jetpack/connect/install',
		jetpackConnectController.install,
		makeLayout,
		clientRender
	);

	page(
	    '/jetpack/connect/personal',
		jetpackConnectController.personal,
		makeLayout,
		clientRender
	);
	page(
	    '/jetpack/connect/personal/:intervalType',
		jetpackConnectController.personal,
		makeLayout,
		clientRender
	);

	page(
	    '/jetpack/connect/premium',
		jetpackConnectController.premium,
		makeLayout,
		clientRender
	);
	page(
	    '/jetpack/connect/premium/:intervalType',
		jetpackConnectController.premium,
		makeLayout,
		clientRender
	);

	page(
	    '/jetpack/connect/pro',
		jetpackConnectController.pro,
		makeLayout,
		clientRender
	);
	page(
	    '/jetpack/connect/pro/:intervalType',
		jetpackConnectController.pro,
		makeLayout,
		clientRender
	);

	page(
	    '/jetpack/connect',
		jetpackConnectController.connect,
		makeLayout,
		clientRender
	);

	page(
	    '/jetpack/connect/choose/:site',
		jetpackConnectController.plansPreSelection,
		makeLayout,
		clientRender
	);

	page(
	    '/jetpack/connect/authorize/:localeOrInterval?',
		jetpackConnectController.redirectWithoutLocaleifLoggedIn,
		jetpackConnectController.saveQueryObject,
		jetpackConnectController.authorizeForm,
		makeLayout,
		clientRender
	);

	page(
	    '/jetpack/connect/authorize/:intervalType/:locale',
		jetpackConnectController.redirectWithoutLocaleifLoggedIn,
		jetpackConnectController.saveQueryObject,
		jetpackConnectController.authorizeForm,
		makeLayout,
		clientRender
	);

	page(
	    '/jetpack/connect/install/:locale?',
		jetpackConnectController.redirectWithoutLocaleifLoggedIn,
		jetpackConnectController.install,
		makeLayout,
		clientRender
	);

	page(
	    '/jetpack/connect/store',
		jetpackConnectController.plansLanding,
		makeLayout,
		clientRender
	);
	page(
	    '/jetpack/connect/store/:intervalType',
		jetpackConnectController.plansLanding,
		makeLayout,
		clientRender
	);

	page(
	    '/jetpack/connect/vaultpress',
		jetpackConnectController.vaultpressLanding,
		makeLayout,
		clientRender
	);
	page(
	    '/jetpack/connect/vaultpress/:intervalType',
		jetpackConnectController.vaultpressLanding,
		makeLayout,
		clientRender
	);

	page(
	    '/jetpack/connect/akismet',
		jetpackConnectController.akismetLanding,
		makeLayout,
		clientRender
	);
	page(
	    '/jetpack/connect/akismet/:intervalType',
		jetpackConnectController.akismetLanding,
		makeLayout,
		clientRender
	);

	page(
	    '/jetpack/connect/:locale?',
		jetpackConnectController.redirectWithoutLocaleifLoggedIn,
		jetpackConnectController.connect,
		makeLayout,
		clientRender
	);

	page(
	    '/jetpack/connect/plans/:site',
		sitesController.siteSelection,
		jetpackConnectController.plansSelection,
		makeLayout,
		clientRender
	);

	page(
	    '/jetpack/connect/plans/:intervalType/:site',
		sitesController.siteSelection,
		jetpackConnectController.plansSelection,
		makeLayout,
		clientRender
	);

	page(
	    '/jetpack/sso/:siteId?/:ssoNonce?',
		jetpackConnectController.sso,
		makeLayout,
		clientRender
	);
	page('/jetpack/sso/*', jetpackConnectController.sso, makeLayout, clientRender);
}
