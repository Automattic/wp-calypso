/**
 * External Dependencies
 */
var page = require( 'page' ),
	ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	defer = require( 'lodash/function/defer' );

/**
 * Internal Dependencies
 */
var sites = require( 'lib/sites-list' )(),
	route = require( 'lib/route' ),
	i18n = require( 'lib/mixins/i18n' ),
	analytics = require( 'analytics' ),
	plans = require( 'lib/plans-list' )(),
	config = require( 'config' ),
	upgradesActions = require( 'lib/upgrades/actions' ),
	titleActions = require( 'lib/screen-title/actions' );

function handlePlanSelect( cartItem, siteSlug ) {
	upgradesActions.addItem( cartItem );

	// FIXME: @rads: The `defer` is necessary here to prevent an error with
	//   React when changing pages, but the root cause is currently unknown.
	defer( function() {
		page( '/checkout/' + sites.getSelectedSite().slug );
	} );
}

function onSelectPlan( cartItem ) {
	handlePlanSelect( cartItem, sites.getSelectedSite().slug );
}

module.exports = {

	plans: function( context ) {
		var Plans = require( 'my-sites/plans/main' ),
			CartData = require( 'components/data/cart' ),
			MainComponent = require( 'components/main' ),
			EmptyContentComponent = require( 'components/empty-content' ),
			siteSpecificPlansDetailsList = require( 'lib/site-specific-plans-details-list' )(),
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

		ReactDom.render(
			<CartData>
				<Plans sites={ sites }
					onSelectPlan={ onSelectPlan }
					plans={ plans }
					siteSpecificPlansDetailsList={ siteSpecificPlansDetailsList }
					context={ context } />
			</CartData>,
			document.getElementById( 'primary' )
		);
	},

	plansCompare: function( context ) {
		var PlansCompare = require( 'components/plans/plans-compare' ),
			Main = require( 'components/main' ),
			CartData = require( 'components/data/cart' ),
			siteSpecificPlansDetailsList = require( 'lib/site-specific-plans-details-list' )(),
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

		ReactDom.render(
			<Main className="plans has-sidebar">
				<CartData>
					<PlansCompare sites={ sites }
						onSelectPlan={ onSelectPlan }
						plans={ plans }
						features={ features }
						siteSpecificPlansDetailsList={ siteSpecificPlansDetailsList }
						productsList={ productsList } />
				</CartData>
			</Main>,
			document.getElementById( 'primary' )
		);
	},

	plansSelect: function( context ) {
		var CartData = require( 'components/data/cart' ),
			PlansSelect = require( 'my-sites/plans/plans-select' );

		ReactDom.render(
			<CartData>
				<PlansSelect context={ context } sites={ sites } plans={ plans } />
			</CartData>,
			document.getElementById( 'primary' )
		);
	},

	handlePlanSelect,
};
