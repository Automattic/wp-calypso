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

// Wrap controller.connect so we can pre-load known route options
const getJetpackConnectHandler = ( options ) =>
	( context ) => controller.connect( context, options );

export default function() {
	page( '/jetpack/connect/install', getJetpackConnectHandler( { type: 'install' } ) );

	page( '/jetpack/connect/personal', getJetpackConnectHandler( { type: 'personal' } ) );
	page( '/jetpack/connect/personal/yearly', getJetpackConnectHandler( { type: 'personal' } ) );
	page( '/jetpack/connect/personal/monthly', getJetpackConnectHandler( { type: 'personal', interval: 'monthly' } ) );

	page( '/jetpack/connect/premium', getJetpackConnectHandler( { type: 'premium' } ) );
	page( '/jetpack/connect/premium/yearly', getJetpackConnectHandler( { type: 'premium' } ) );
	page( '/jetpack/connect/premium/monthly', getJetpackConnectHandler( { type: 'premium', interval: 'monthly' } ) );

	page( '/jetpack/connect/pro', getJetpackConnectHandler( { type: 'pro' } ) );
	page( '/jetpack/connect/pro/yearly', getJetpackConnectHandler( { type: 'pro' } ) );
	page( '/jetpack/connect/pro/monthly', getJetpackConnectHandler( { type: 'pro', interval: 'monthly' } ) );

	page( '/jetpack/connect', getJetpackConnectHandler() );

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
		getJetpackConnectHandler( { type: 'install' } )
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
