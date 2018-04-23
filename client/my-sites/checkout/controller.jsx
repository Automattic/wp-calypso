/** @format */
/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import React from 'react';
import { isEmpty } from 'lodash';

/**
 * Internal Dependencies
 */
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

export default {
	checkout: function( context, next ) {
		const { feature, plan, product } = context.params;

		const state = context.store.getState();
		const selectedSite = getSelectedSite( state );

		if ( 'thank-you' === product ) {
			return;
		}

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Checkout' ) ) );

		context.primary = (
			<CheckoutData>
				<Checkout
					product={ product }
					purchaseId={ context.params.purchaseId }
					selectedFeature={ feature }
					couponCode={ context.query.code }
					plan={ plan }
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
		const orderId = Number( context.params.orderId );
		const siteSlug = context.params.site;

		context.store.dispatch( setSection( { name: 'checkout-thank-you' }, { hasSidebar: false } ) );

		context.primary = <CheckoutPendingComponent orderId={ orderId } siteSlug={ siteSlug } />;

		next();
	},

	checkoutThankYou: function( context, next ) {
		const receiptId = Number( context.params.receiptId );
		const gsuiteReceiptId = Number( context.params.gsuiteReceiptId ) || 0;
		const { feature } = context.params;

		const state = context.store.getState();
		const selectedSite = getSelectedSite( state );

		context.store.dispatch( setSection( { name: 'checkout-thank-you' }, { hasSidebar: false } ) );

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Thank You' ) ) );

		let analyticsPath = '';
		let analyticsProps = {};
		if ( gsuiteReceiptId ) {
			analyticsPath = '/checkout/thank-you/:site/:receipt_id/with-gsuite/:gsuite_receipt_id';
			analyticsProps = {
				gsuiteReceiptId: gsuiteReceiptId,
				receiptId,
				site: selectedSite.slug,
			};
		} else if ( feature && receiptId ) {
			analyticsPath = '/checkout/thank-you/features/:feature/:site/:receipt_id';
			analyticsProps = {
				feature,
				receiptId,
				site: selectedSite.slug,
			};
		} else if ( feature && ! receiptId ) {
			analyticsPath = '/checkout/thank-you/features/:feature/:site';
			analyticsProps = {
				feature,
				site: selectedSite.slug,
			};
		} else if ( receiptId && selectedSite ) {
			analyticsPath = '/checkout/thank-you/:site/:receipt_id';
			analyticsProps = { receiptId, site: selectedSite.slug };
		} else if ( receiptId && ! selectedSite ) {
			analyticsPath = '/checkout/thank-you/no-site/:receipt_id';
			analyticsProps = { receiptId };
		} else if ( selectedSite ) {
			analyticsPath = '/checkout/thank-you/:site';
			analyticsProps = { site: selectedSite.slug };
		} else {
			analyticsPath = '/checkout/thank-you/no-site';
		}

		context.primary = (
			<CheckoutThankYouComponent
				analyticsPath={ analyticsPath }
				analyticsProps={ analyticsProps }
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
		const { domain, site, receiptId } = context.params;
		context.store.dispatch( setSection( { name: 'gsuite-nudge' }, { hasSidebar: false } ) );

		const state = context.store.getState();
		const selectedSite =
			getSelectedSite( state ) || getSiteBySlug( state, site ) || getSiteBySlug( state, domain );

		if ( ! selectedSite ) {
			return null;
		}

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
