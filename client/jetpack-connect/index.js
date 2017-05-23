/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import sitesController from 'my-sites/controller';

const redirectToStoreWithInterval = context => {
	const intervalType = context && context.params && context.params.intervalType
		? context.params.intervalType
		: '';
	page.redirect( `/jetpack/connect/store/${ intervalType }` );
};

export default function() {
	page( '/jetpack/connect/install', controller.install );

	page( '/jetpack/connect/personal', controller.personal );
	page( '/jetpack/connect/personal/:intervalType', controller.personal );

	page( '/jetpack/connect/premium', controller.premium );
	page( '/jetpack/connect/premium/:intervalType', controller.premium );

	page( '/jetpack/connect/pro', controller.pro );
	page( '/jetpack/connect/pro/:intervalType', controller.pro );

	page( '/jetpack/connect', controller.connect );

	page( '/jetpack/connect/choose/:site', controller.plansPreSelection );

	page(
		'/jetpack/connect/authorize/:localeOrInterval?',
		controller.redirectWithoutLocaleifLoggedIn,
		controller.saveQueryObject,
		controller.authorizeForm
	);

	page(
		'/jetpack/connect/authorize/:intervalType/:locale',
		controller.redirectWithoutLocaleifLoggedIn,
		controller.saveQueryObject,
		controller.authorizeForm
	);

	page(
		'/jetpack/connect/install/:locale?',
		controller.redirectWithoutLocaleifLoggedIn,
		controller.install
	);

	page( '/jetpack/connect/store', controller.plansLanding );
	page( '/jetpack/connect/store/:intervalType', controller.plansLanding );

	page( '/jetpack/connect/vaultpress', '/jetpack/connect/store' );
	page( '/jetpack/connect/vaultpress/:intervalType', redirectToStoreWithInterval );

	page( '/jetpack/connect/akismet', '/jetpack/connect/store' );
	page( '/jetpack/connect/akismet/:intervalType', redirectToStoreWithInterval );

	page(
		'/jetpack/connect/:locale?',
		controller.redirectWithoutLocaleifLoggedIn,
		controller.connect
	);

	page(
		'/jetpack/connect/plans/:site',
		sitesController.siteSelection,
		controller.plansSelection
	);

	page(
		'/jetpack/connect/plans/:intervalType/:site',
		sitesController.siteSelection,
		controller.plansSelection
	);

	page( '/jetpack/sso/:siteId?/:ssoNonce?', controller.sso );
	page( '/jetpack/sso/*', controller.sso );
	page( '/jetpack/new', controller.newSite );
}
