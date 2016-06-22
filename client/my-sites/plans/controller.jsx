/**
 * External Dependencies
 */
import page from 'page';
import React from 'react';
import ReactDom from 'react-dom';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import config from 'config';
import { renderWithReduxStore } from 'lib/react-helpers';
import route from 'lib/route';
import sitesFactory from 'lib/sites-list';
import titleActions from 'lib/screen-title/actions';
import get from 'lodash/get';
import { isValidFeatureKey } from 'lib/plans';

const sites = sitesFactory();

export default {
	plans( context ) {
		const Plans = require( 'my-sites/plans/main' ),
			CheckoutData = require( 'components/data/checkout' ),
			MainComponent = require( 'components/main' ),
			EmptyContentComponent = require( 'components/empty-content' ),
			site = sites.getSelectedSite(),
			analyticsPageTitle = 'Plans',
			basePath = route.sectionify( context.path );
		let analyticsBasePath;

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
			<CheckoutData>
				<Plans
					sites={ sites }
					context={ context }
					intervalType={ context.params.intervalType }
					destinationType={ context.params.destinationType } />
			</CheckoutData>,
			document.getElementById( 'primary' ),
			context.store
		);
	},

	plansCompare( context ) {
		const PlansCompare = require( 'components/plans/plans-compare' ),
			Main = require( 'components/main' ),
			CheckoutData = require( 'components/data/checkout' ),
			features = require( 'lib/features-list' )(),
			productsList = require( 'lib/products-list' )(),
			analyticsPageTitle = 'Plans > Compare',
			site = sites.getSelectedSite(),
			basePath = route.sectionify( context.path );
		let baseAnalyticsPath;

		if ( config.isEnabled( 'manage/plan-features' ) ) {
			return page.redirect( '/plans/features' );
		}

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

		// Scroll to the top
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}

		renderWithReduxStore(
			<Main className="plans has-sidebar">
				<CheckoutData>
					<PlansCompare
						selectedSite={ site }
						features={ features }
						selectedFeature={ context.params.feature || context.query.feature }
						intervalType={ context.params.intervalType }
						productsList={ productsList } />
				</CheckoutData>
			</Main>,
			document.getElementById( 'primary' ),
			context.store
		);
	},

	features( context ) {
		const domain = context.params.domain;
		const feature = get( context, 'params.feature' );
		let comparePath = domain ? `/plans/compare/${ domain }` : '/plans/compare';

		if ( isValidFeatureKey( feature ) ) {
			comparePath += '?feature=' + feature;
		}

		// otherwise redirect to the compare page if not found
		page.redirect( comparePath );
	},

	redirectToCheckout( context ) {
		// this route is deprecated, use `/checkout/:site/:plan` to link to plan checkout
		page.redirect( `/checkout/${ context.params.domain }/${ context.params.plan }` );
	}
};
