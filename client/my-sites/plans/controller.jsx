/**
 * External Dependencies
 */
var page = require( 'page' ),
	ReactDom = require( 'react-dom' ),
	React = require( 'react' );

/**
 * Internal Dependencies
 */
var sites = require( 'lib/sites-list' )(),
	route = require( 'lib/route' ),
	i18n = require( 'lib/mixins/i18n' ),
	analytics = require( 'analytics' ),
	getABTestVariation = require( 'lib/abtest' ).getABTestVariation,
	plans = require( 'lib/plans-list' )(),
	config = require( 'config' ),
	renderWithReduxStore = require( 'lib/react-helpers' ).renderWithReduxStore,
	titleActions = require( 'lib/screen-title/actions' );

module.exports = {

	plans: function( context ) {
		var Plans = require( 'my-sites/plans/main' ),
			CartData = require( 'components/data/cart' ),
			MainComponent = require( 'components/main' ),
			EmptyContentComponent = require( 'components/empty-content' ),
			site = sites.getSelectedSite(),
			analyticsPageTitle = 'Plans',
			basePath = route.sectionify( context.path ),
			analyticsBasePath;

		// Don't show plans for Jetpack sites
		if ( site && site.jetpack && ! config.isEnabled( 'manage/jetpack-plans' ) ) {
			analytics.pageView.record( basePath + '/jetpack/:site', analyticsPageTitle + ' > Jetpack Plans Not Available' );

			ReactDom.render(
				React.createElement( MainComponent, null,
					React.createElement( EmptyContentComponent, {
						title: i18n.translate( 'Plans are not available for Jetpack sites yet.' ),
						line: i18n.translate( 'Looking for spam protection?' ),
						action: i18n.translate( 'Try Akismet' ),
						actionURL: '//akismet.com/plans/?ref=calypso-plans',
						illustration: '/calypso/images/drake/drake-nomenus.svg'
					} )
				),
				document.getElementById( 'primary' )
			);
			return;
		}

		if ( site ) {
			analyticsBasePath = basePath + '/:site';
		} else {
			analyticsBasePath = basePath;
		}

		titleActions.setTitle( i18n.translate( 'Plans', { textOnly: true } ),
			{ siteID: route.getSiteFragment( context.path ) }
		);

		analytics.tracks.recordEvent( 'calypso_plans_view' );
		analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

		renderWithReduxStore(
			<CartData>
				<Plans
					sites={ sites }
					plans={ plans }
					context={ context }
					destinationType={ context.params.destinationType } />
			</CartData>,
			document.getElementById( 'primary' ),
			context.store
		);
	},

	plansCompare: function( context ) {
		var PlansCompare = require( 'components/plans/plans-compare' ),
			Main = require( 'components/main' ),
			CartData = require( 'components/data/cart' ),
			features = require( 'lib/features-list' )(),
			productsList = require( 'lib/products-list' )(),
			analyticsPageTitle = 'Plans > Compare',
			site = sites.getSelectedSite(),
			basePath = route.sectionify( context.path ),
			baseAnalyticsPath;

		if ( site && ! site.isUpgradeable() ) {
			return page.redirect( '/plans/compare' );
		}

		if ( site ) {
			baseAnalyticsPath = basePath + '/:site';
		} else {
			baseAnalyticsPath = basePath;
		}

		analytics.pageView.record( baseAnalyticsPath, analyticsPageTitle );

		titleActions.setTitle( i18n.translate( 'Compare Plans', { textOnly: true } ), {
			siteID: context.params.domain
		} );

		renderWithReduxStore(
			<Main className="plans has-sidebar">
				<CartData>
					<PlansCompare
						enableFreeTrials={ getABTestVariation( 'freeTrials' ) === 'offered' }
						selectedSite={ site }
						plans={ plans }
						features={ features }
						productsList={ productsList } />
				</CartData>
			</Main>,
			document.getElementById( 'primary' ),
			context.store
		);
	},

	redirectToCheckout: function( context ) {
		// this route is deprecated, use `/checkout/:site/:plan` to link to plan checkout
		page.redirect( `/checkout/${ context.params.domain }/${ context.params.plan }` );
	}
};
