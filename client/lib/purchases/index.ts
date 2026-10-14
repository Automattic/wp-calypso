import { isAkismetProduct } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { encodeProductForUrl } from '@automattic/wpcom-checkout';
import debugFactory from 'debug';
import moment from 'moment';
import { isMarketplaceHoldingSitePurchase as isRawMarketplaceHoldingSitePurchase } from 'calypso/dashboard/utils/purchase';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getRenewalItemFromProduct } from 'calypso/lib/cart-values/cart-items';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { addQueryArgs } from 'calypso/lib/url';
import { errorNotice } from 'calypso/state/notices/actions';
import type { Purchase as RawPurchase } from '@automattic/api-core';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { CalypsoDispatch } from 'calypso/state/types';

const debug = debugFactory( 'calypso:purchases' );

export type TracksProps = Record< string, string | number | boolean >;

/**
 * Adds a purchase renewal to the cart and redirects to checkout.
 * @param {Object} purchase - the purchase to be renewed
 * @param {string} siteSlug - the site slug to renew the purchase for
 * @param {Object} [options] - optional information
 * @param {string} [options.redirectTo] - Passed as redirect_to in checkout
 * @param {string} [options.cancelTo] - Passed as cancel_to in checkout
 * @param {Object} [options.tracksProps] - where was the renew button clicked from
 */
export function handleRenewNowClick(
	purchase: RawPurchase,
	siteSlug: string,
	options: { redirectTo?: string; cancelTo?: string; tracksProps?: TracksProps } = {}
) {
	return ( dispatch: CalypsoDispatch ) => {
		try {
			const renewItem = getRenewalItemFromProduct(
				{ ...purchase, id: Number( purchase.ID ), isRenewable: purchase.is_renewable },
				{ domain: purchase.meta }
			);

			// Track the renew now submit.
			recordTracksEvent( 'calypso_purchases_renew_now_click', {
				product_slug: purchase.product_slug,
				...options.tracksProps,
			} );

			if ( ! renewItem.extra?.purchaseId ) {
				throw new Error( 'Could not find purchase id for renewal.' );
			}
			if ( ! renewItem.product_slug ) {
				throw new Error( 'Could not find product slug for renewal.' );
			}
			const { productSlugs, purchaseIds } = getProductSlugsAndPurchaseIds( [ renewItem ] );

			let serviceSlug = '';

			if ( isAkismetProduct( { product_slug: productSlugs[ 0 ] } ) ) {
				serviceSlug = 'akismet/';
			} else if ( isRawMarketplaceHoldingSitePurchase( purchase ) ) {
				serviceSlug = 'marketplace/';
			}

			// Siteless Akismet and Marketplace renewals keep the service in the path
			// because the route is what selects the service-specific checkout
			// experience. Everything else renews from the subscription ID alone.
			let renewalUrl = `/checkout/${ serviceSlug }renew/${ purchaseIds[ 0 ] }`;

			renewalUrl = addQueryArgs(
				{ redirect_to: options.redirectTo, cancel_to: options.cancelTo },
				renewalUrl
			);
			debug( 'handling renewal click', purchase, siteSlug, renewItem, renewalUrl );

			page(
				isJetpackCloud() || isA8CForAgencies() ? `https://wordpress.com${ renewalUrl }` : renewalUrl
			);
		} catch ( error ) {
			dispatch( errorNotice( ( error as Error ).message ) );
		}
	};
}

function getProductSlugsAndPurchaseIds( renewItems: MinimalRequestCartProduct[] ) {
	const productSlugs: string[] = [];
	const purchaseIds: string[] = [];

	renewItems.forEach( ( currentRenewItem ) => {
		if ( ! currentRenewItem.extra?.purchaseId ) {
			debug( 'Could not find purchase id for renewal.', currentRenewItem );
			return null;
		}
		if ( ! currentRenewItem.product_slug ) {
			debug( 'Could not find product slug for renewal.', currentRenewItem );
			return null;
		}
		// Some product slugs or meta contain slashes which will break the URL, so
		// we encode them first. We cannot use encodeURIComponent because the
		// calypso router seems to break if the trailing part of the URL contains
		// an encoded slash.
		const productSlug = encodeProductForUrl( currentRenewItem.product_slug );
		productSlugs.push(
			currentRenewItem.meta
				? `${ productSlug }:${ encodeProductForUrl( currentRenewItem.meta ) }`
				: productSlug
		);
		purchaseIds.push( currentRenewItem.extra.purchaseId );
	} );
	return { productSlugs, purchaseIds };
}

export function shouldAddPaymentSourceInsteadOfRenewingNow( purchase: { expiryDate?: string } ) {
	if ( ! purchase || ! purchase.expiryDate ) {
		return false;
	}
	return moment( purchase.expiryDate ) > moment().add( 3, 'months' );
}
