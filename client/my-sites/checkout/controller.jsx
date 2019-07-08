/** @format */
/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import React from 'react';
import { get, isEmpty } from 'lodash';

/**
 * Internal Dependencies
 */
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { setSection } from 'state/ui/actions';
import { getSiteBySlug } from 'state/sites/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import GSuiteNudge from 'my-sites/checkout/gsuite-nudge';
import CheckoutContainer from './checkout/checkout-container';
import CartData from 'components/data/cart';
import CheckoutPendingComponent from './checkout-thank-you/pending';
import CheckoutThankYouComponent from './checkout-thank-you';
import ConciergeSessionNudge from './concierge-session-nudge';
import { isGSuiteRestricted } from 'lib/gsuite';
import { getRememberedCoupon } from 'lib/upgrades/actions';

export function checkout( context, next ) {
	const { feature, plan, product, purchaseId } = context.params;

	const state = context.store.getState();
	const selectedSite = getSelectedSite( state );

	if ( 'thank-you' === product ) {
		return;
	}

	// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'Checkout' ) ) );

	context.store.dispatch( setSection( { name: 'checkout' }, { hasSidebar: false } ) );

	context.primary = (
		<CheckoutContainer
			product={ product }
			purchaseId={ purchaseId }
			selectedFeature={ feature }
			// NOTE: `context.query.code` is deprecated in favor of `context.query.coupon`.
			couponCode={ context.query.coupon || context.query.code || getRememberedCoupon() }
			plan={ plan }
			selectedSite={ selectedSite }
			reduxStore={ context.store }
			redirectTo={ context.query.redirect_to }
			clearTransaction={ false }
		/>
	);

	next();
}

export function checkoutPending( context, next ) {
	const orderId = Number( context.params.orderId );
	const siteSlug = context.params.site;

	context.store.dispatch( setSection( { name: 'checkout-thank-you' }, { hasSidebar: false } ) );

	context.primary = <CheckoutPendingComponent orderId={ orderId } siteSlug={ siteSlug } />;

	next();
}

export function checkoutThankYou( context, next ) {
	const receiptId = Number( context.params.receiptId );
	const gsuiteReceiptId = Number( context.params.gsuiteReceiptId ) || 0;

	const state = context.store.getState();
	const selectedSite = getSelectedSite( state );
	const displayMode = get( context, 'query.d' );

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
			displayMode={ displayMode }
		/>
	);

	next();
}

export function gsuiteNudge( context, next ) {
	const { domain, site, receiptId } = context.params;
	context.store.dispatch( setSection( { name: 'gsuite-nudge' }, { hasSidebar: false } ) );

	const state = context.store.getState();
	const selectedSite =
		getSelectedSite( state ) || getSiteBySlug( state, site ) || getSiteBySlug( state, domain );

	if ( ! selectedSite ) {
		return null;
	}

	if ( isGSuiteRestricted() ) {
		next();
	}

	context.primary = (
		<CartData>
			<GSuiteNudge
				domain={ domain }
				receiptId={ Number( receiptId ) }
				selectedSiteId={ selectedSite.ID }
			/>
		</CartData>
	);

	next();
}

export function conciergeSessionNudge( context, next ) {
	const { receiptId, site } = context.params;

	let conciergeSessionType;

	if ( context.path.includes( 'offer-quickstart-session' ) ) {
		conciergeSessionType = 'concierge-quickstart-session';
	} else if ( context.path.match( /(add|offer)-support-session/ ) ) {
		conciergeSessionType = 'concierge-support-session';
	}
	context.store.dispatch( setSection( { name: conciergeSessionType }, { hasSidebar: false } ) );

	context.primary = (
		<CheckoutContainer
			shouldShowCart={ false }
			clearTransaction={ true }
			purchaseId={ Number( receiptId ) }
		>
			<ConciergeSessionNudge
				siteSlugParam={ site }
				receiptId={ Number( receiptId ) }
				conciergeSessionType={ conciergeSessionType }
			/>
		</CheckoutContainer>
	);

	next();
}
