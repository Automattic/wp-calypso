/** @format */
/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import React from 'react';
import { isEmpty } from 'lodash';
import { Route } from 'page';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import { sectionifyWithRoutes } from 'lib/route';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { setSection } from 'state/ui/actions';
import { getSiteBySlug } from 'state/sites/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import GsuiteNudge from 'my-sites/checkout/gsuite-nudge';
import Checkout from './checkout';
import CheckoutData from 'components/data/checkout';
import CartData from 'components/data/cart';
import SecondaryCart from './cart/secondary-cart';
import CheckoutPendingComponent from './checkout-thank-you/pending';
import CheckoutThankYouComponent from './checkout-thank-you';
import PageViewTracker from 'lib/analytics/page-view-tracker';

const checkoutGSuiteNudgeRoutes = [
	new Route( '/checkout/:site/with-gsuite/:domain/:receipt' ),
	new Route( '/checkout/:site/with-gsuite/:domain' ),
];

const checkoutPendingRoutes = [
	new Route( '/checkout/thank-you/no-site/pending/:orderId' ),
	new Route( '/checkout/thank-you/:site/pending/:orderId' ),
];

const checkoutThankYouRoutes = [
	new Route( '/checkout/thank-you/no-site/:receipt' ),
	new Route( '/checkout/thank-you/no-site' ),
	new Route( '/checkout/thank-you/:site/:receipt' ),
	new Route( '/checkout/thank-you/:site' ),
	new Route( '/checkout/thank-you/:site/:receipt/with-gsuite/:gsuiteReceipt' ),
	new Route( '/checkout/thank-you/:site/:receipt/with-gsuite' ),
	new Route( '/checkout/thank-you/features/:feature/:site/:receipt' ),
	new Route( '/checkout/thank-you/features/:feature/:site' ),
];

export default {
	checkout: function( context, next ) {
		const { domain, feature, plan, product, purchase } = context.params;

		const state = context.store.getState();
		const selectedSite = getSelectedSite( state );

		if ( 'thank-you' === product ) {
			return;
		}

		let analyticsPath;
		let analyticsProps;
		if ( purchase && product ) {
			analyticsPath = '/checkout/:product/renew/:purchase_id/:site';
			analyticsProps = { product, purchaseId: purchase, site: domain };
		} else if ( feature && plan ) {
			analyticsPath = '/checkout/features/:feature/:site/:plan';
			analyticsProps = { feature, plan, site: domain };
		} else if ( feature && ! plan ) {
			analyticsPath = '/checkout/features/:feature/:site';
			analyticsProps = { feature, site: domain };
		} else if ( product && ! purchase ) {
			analyticsPath = '/checkout/:site/:product';
			analyticsProps = { product, site: domain };
		} else {
			analyticsPath = '/checkout/:site';
			analyticsProps = { site: domain };
		}

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Checkout' ) ) );

		context.primary = (
			<CheckoutData>
				<PageViewTracker path={ analyticsPath } title="Checkout" properties={ analyticsProps } />
				<Checkout
					product={ product }
					purchaseId={ context.params.purchaseId }
					selectedFeature={ feature }
					couponCode={ context.query.code }
				/>
			</CheckoutData>
		);

		context.secondary = (
			<CartData>
				<SecondaryCart selectedSite={ selectedSite } />
			</CartData>
		);
		next();
	},

	sitelessCheckout: function( context, next ) {
		analytics.pageView.record( '/checkout/no-site', 'Checkout' );

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Checkout' ) ) );

		context.primary = (
			<CheckoutData>
				<Checkout reduxStore={ context.store } />
			</CheckoutData>
		);

		context.secondary = (
			<CartData>
				<SecondaryCart />
			</CartData>
		);
		next();
	},

	checkoutPending: function( context, next ) {
		const { routePath, routeParams } = sectionifyWithRoutes( context.path, checkoutPendingRoutes );
		const orderId = Number( context.params.orderId );
		const siteSlug = context.params.site;

		analytics.pageView.record( routePath, 'Checkout Pending', routeParams );
		context.store.dispatch( setSection( { name: 'checkout-thank-you' }, { hasSidebar: false } ) );

		context.primary = <CheckoutPendingComponent orderId={ orderId } siteSlug={ siteSlug } />;

		next();
	},

	checkoutThankYou: function( context, next ) {
		const { routePath, routeParams } = sectionifyWithRoutes( context.path, checkoutThankYouRoutes );
		const receiptId = Number( context.params.receiptId );
		const gsuiteReceiptId = Number( context.params.gsuiteReceiptId ) || 0;

		const state = context.store.getState();
		const selectedSite = getSelectedSite( state );

		analytics.pageView.record( routePath, 'Checkout Thank You', routeParams );

		context.store.dispatch( setSection( { name: 'checkout-thank-you' }, { hasSidebar: false } ) );

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Thank You' ) ) );

		context.primary = (
			<CheckoutThankYouComponent
				receiptId={ receiptId }
				gsuiteReceiptId={ gsuiteReceiptId }
				domainOnlySiteFlow={ isEmpty( context.params.site ) }
				selectedFeature={ context.params.feature }
				selectedSite={ selectedSite }
			/>
		);

		next();
	},

	gsuiteNudge( context, next ) {
		const { routePath, routeParams } = sectionifyWithRoutes(
			context.path,
			checkoutGSuiteNudgeRoutes
		);
		const { domain, site, receiptId } = context.params;
		context.store.dispatch( setSection( { name: 'gsuite-nudge' }, { hasSidebar: false } ) );

		const state = context.store.getState();
		const selectedSite =
			getSelectedSite( state ) || getSiteBySlug( state, site ) || getSiteBySlug( state, domain );

		if ( ! selectedSite ) {
			return null;
		}

		analytics.pageView.record( routePath, 'G Suite Upsell', routeParams );

		context.primary = (
			<CartData>
				<GsuiteNudge
					domain={ domain }
					receiptId={ Number( receiptId ) }
					selectedSiteId={ selectedSite.ID }
				/>
			</CartData>
		);

		next();
	},
};
