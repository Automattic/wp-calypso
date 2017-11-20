/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import { siteSelection } from 'my-sites/controller';

const redirectToStoreWithInterval = context => {
	const interval =
		context && context.params && context.params.interval ? context.params.interval : '';
	page.redirect( `/jetpack/connect/store/${ interval }` );
};

export default function() {
	page(
		'/jetpack/connect/:type(personal|premium|pro)/:interval(yearly|monthly)?',
		controller.connect
	);

	page(
		'/jetpack/connect/:type(install)/:locale?',
		controller.redirectWithoutLocaleifLoggedIn,
		controller.connect
	);

	page( '/jetpack/connect', controller.connect );

	page(
		'/jetpack/connect/authorize/:localeOrInterval?',
		controller.redirectWithoutLocaleifLoggedIn,
		controller.saveQueryObject,
		controller.authorizeForm
	);

	page(
		'/jetpack/connect/authorize/:interval/:locale',
		controller.redirectWithoutLocaleifLoggedIn,
		controller.saveQueryObject,
		controller.authorizeForm
	);

	page( '/jetpack/connect/store', controller.plansLanding );
	page( '/jetpack/connect/store/:interval', controller.plansLanding );

	page( '/jetpack/connect/vaultpress', '/jetpack/connect/store' );
	page( '/jetpack/connect/vaultpress/:interval', redirectToStoreWithInterval );

	page( '/jetpack/connect/akismet', '/jetpack/connect/store' );
	page( '/jetpack/connect/akismet/:interval', redirectToStoreWithInterval );

	page(
		'/jetpack/connect/:locale?',
		controller.redirectWithoutLocaleifLoggedIn,
		controller.connect
	);

	page( '/jetpack/connect/plans/:site', siteSelection, controller.plansSelection );
	page( '/jetpack/connect/plans/:interval/:site', siteSelection, controller.plansSelection );

	page( '/jetpack/sso/:siteId?/:ssoNonce?', controller.sso );
	page( '/jetpack/sso/*', controller.sso );
	page( '/jetpack/new', controller.newSite );
	page( '/jetpack/new/*', '/jetpack/connect' );
}
