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
import Checkout from './checkout';
import CheckoutData from 'components/data/checkout';
import CartData from 'components/data/cart';
import SecondaryCart from './cart/secondary-cart';
import CheckoutPendingComponent from './checkout-thank-you/pending';
import CheckoutThankYouComponent from './checkout-thank-you';
import ConciergeSessionNudge from './concierge-session-nudge';
import ConciergeQuickstartSession from './concierge-quickstart-session';
import { isGSuiteRestricted } from 'lib/gsuite';
import FormattedHeader from 'components/formatted-header';
import { abtest } from 'lib/abtest';

export function checkout( context, next ) {
	const { feature, plan, product } = context.params;

	const state = context.store.getState();
	const selectedSite = getSelectedSite( state );

	if ( 'thank-you' === product ) {
		return;
	}

	// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'Checkout' ) ) );

	if ( 'right' === abtest( 'showCheckoutCartRight' ) ) {
		context.store.dispatch( setSection( { name: 'checkout' }, { hasSidebar: false } ) );

		context.primary = (
			<>
				<FormattedHeader />
				<div className="checkout__container">
					<CheckoutData>
						<Checkout
							product={ product }
							purchaseId={ context.params.purchaseId }
							selectedFeature={ feature }
							couponCode={ context.query.code }
							plan={ plan }
						/>
						<CartData>
							<SecondaryCart selectedSite={ selectedSite } />
						</CartData>
					</CheckoutData>
				</div>
			</>
		);

		next();
	}

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
}

export function sitelessCheckout( context, next ) {
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
	const { receiptId } = context.params;
	context.store.dispatch(
		setSection( { name: 'concierge-session-nudge' }, { hasSidebar: false } )
	);

	const state = context.store.getState();
	const selectedSite = getSelectedSite( state );

	if ( ! selectedSite ) {
		return null;
	}

	context.primary = (
		<CartData>
			<ConciergeSessionNudge receiptId={ Number( receiptId ) } selectedSiteId={ selectedSite.ID } />
		</CartData>
	);

	next();
}

export function conciergeQuickstartSession( context, next ) {
	const { receiptId } = context.params;
	context.store.dispatch(
		setSection( { name: 'concierge-quickstart-session' }, { hasSidebar: false } )
	);

	const state = context.store.getState();
	const selectedSite = getSelectedSite( state );

	if ( ! selectedSite ) {
		return null;
	}

	context.primary = (
		<CartData>
			<ConciergeQuickstartSession
				receiptId={ Number( receiptId ) }
				selectedSiteId={ selectedSite.ID }
			/>
		</CartData>
	);

	next();
}
