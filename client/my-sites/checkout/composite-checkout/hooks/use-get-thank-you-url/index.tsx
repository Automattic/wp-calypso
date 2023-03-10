import debugFactory from 'debug';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import getThankYouPageUrl from 'calypso/my-sites/checkout/get-thank-you-page-url';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { CheckoutType } from '@automattic/composite-checkout';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { PostCheckoutUrlArguments } from 'calypso/my-sites/checkout/get-thank-you-page-url';

const debug = debugFactory( 'calypso:composite-checkout:use-get-thank-you-url' );

export type GetThankYouUrl = () => string;

/**
 * Generate the post-checkout URL.
 *
 * This should be a lightweight wrapper around `getThankYouPageUrl()` that
 * fetches some of that function's required arguments. Any actual logic related
 * to generating the URL should remain in `getThankYouUrl()` itself as that
 * function is covered by tests and there are places that call it directly.
 *
 * IMPORTANT NOTE: This will be called BEFORE checkout completes because of
 * redirect payment methods like PayPal. They will redirect directly to the
 * post-checkout page decided by `getThankYouUrl` and therefore must be passed
 * the post-checkout URL before the transaction begins.
 */
export default function useGetThankYouUrl( {
	siteSlug,
	redirectTo,
	purchaseId,
	feature,
	cart,
	checkoutType,
	isJetpackNotAtomic,
	productAliasFromUrl,
	hideNudge,
	isInModal,
	domains,
}: GetThankYouUrlProps ): GetThankYouUrl {
	const selectedSiteData = useSelector( ( state ) => getSelectedSite( state ) );

	const adminUrl = selectedSiteData?.options?.admin_url;

	const getThankYouUrl = useCallback( () => {
		const getThankYouPageUrlArguments: PostCheckoutUrlArguments = {
			siteSlug,
			adminUrl,
			redirectTo,
			purchaseId,
			feature,
			cart,
			checkoutType,
			isJetpackNotAtomic,
			productAliasFromUrl,
			hideNudge,
			isInModal,
			domains,
		};

		debug( 'getThankYouUrl called with', getThankYouPageUrlArguments );
		const url = getThankYouPageUrl( getThankYouPageUrlArguments );
		debug( 'getThankYouUrl returned', url );

		return url;
	}, [
		isInModal,
		siteSlug,
		adminUrl,
		isJetpackNotAtomic,
		productAliasFromUrl,
		redirectTo,
		feature,
		purchaseId,
		cart,
		hideNudge,
		checkoutType,
		domains,
	] );
	return getThankYouUrl;
}

export interface GetThankYouUrlProps {
	siteSlug: string | undefined;
	redirectTo?: string | undefined;
	purchaseId?: number | undefined;
	feature?: string | undefined;
	cart: ResponseCart;
	checkoutType: CheckoutType;
	productAliasFromUrl?: string | undefined;
	hideNudge?: boolean;
	isInModal?: boolean;
	isJetpackNotAtomic?: boolean;
	domains: ResponseDomain[] | undefined;
}
