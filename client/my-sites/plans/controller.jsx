/**
 * External Dependencies
 */
import page from 'page';
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import { isEnabled } from 'config';
import { renderWithReduxStore } from 'lib/react-helpers';
import route from 'lib/route';
import sitesFactory from 'lib/sites-list';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
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
		if ( site && site.jetpack && ! isEnabled( 'manage/jetpack-plans' ) ) {
			analytics.pageView.record( basePath + '/jetpack/:site', analyticsPageTitle + ' > Jetpack Plans Not Available' );

			renderWithReduxStore(
				React.createElement( MainComponent, null,
					React.createElement( EmptyContentComponent, {
						title: i18n.translate( 'Plans are not available for Jetpack sites yet.' ),
						line: i18n.translate( 'Looking for spam protection?' ),
						action: i18n.translate( 'Try Akismet' ),
						actionURL: '//akismet.com/plans/?ref=calypso-plans',
						illustration: '/calypso/images/drake/drake-nomenus.svg'
					} )
				),
				document.getElementById( 'primary' ),
				context.store
			);
			return;
		}

		if ( site ) {
			analyticsBasePath = basePath + '/:site';
		} else {
			analyticsBasePath = basePath;
		}

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Plans', { textOnly: true } ) ) );

		analytics.tracks.recordEvent( 'calypso_plans_view' );
		analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

		// Scroll to the top
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}

		renderWithReduxStore(
			<CheckoutData>
				<Plans
					sites={ sites }
					context={ context }
					intervalType={ context.params.intervalType }
					destinationType={ context.params.destinationType }
					selectedFeature={ context.query.feature }
				/>
			</CheckoutData>,
			document.getElementById( 'primary' ),
			context.store
		);
	},

	features( context ) {
		const domain = context.params.domain;
		const feature = get( context, 'params.feature' );
		let comparePath = domain ? `/plans/${ domain }` : '/plans/';

		if ( isValidFeatureKey( feature ) ) {
			comparePath += '?feature=' + feature;
		}

		// otherwise redirect to the compare page if not found
		page.redirect( comparePath );
	},

	redirectToCheckout( context ) {
		// this route is deprecated, use `/checkout/:site/:plan` to link to plan checkout
		page.redirect( `/checkout/${ context.params.domain }/${ context.params.plan }` );
	},

	redirectToPlans( context ) {
		const siteDomain = context.params.domain;

		if ( siteDomain ) {
			return page.redirect( `/plans/${ siteDomain }` );
		}

		return page.redirect( '/plans' );
	}
};
