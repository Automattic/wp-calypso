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
	page( '/jetpack/connect/:type(personal|premium|pro)/:interval(yearly|monthly)?', controller.connect );

	page( '/jetpack/connect/:type(install)/:locale?',
		controller.redirectWithoutLocaleifLoggedIn,
		controller.connect
	);

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
