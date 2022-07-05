import debugFactory from 'debug';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import isEligibleForSignupDestination from 'calypso/state/selectors/is-eligible-for-signup-destination';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import getThankYouPageUrl from './get-thank-you-page-url';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { ResponseDomain } from 'calypso/lib/domains/types';

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
	isJetpackNotAtomic,
	productAliasFromUrl,
	hideNudge,
	isInModal,
	isJetpackCheckout = false,
	domains,
}: GetThankYouUrlProps ): GetThankYouUrl {
	const selectedSiteData = useSelector( ( state ) => getSelectedSite( state ) );

	const adminUrl = selectedSiteData?.options?.admin_url;
	const isEligibleForSignupDestinationResult = isEligibleForSignupDestination( cart );

	const getThankYouUrl = useCallback( () => {
		const getThankYouPageUrlArguments = {
			siteSlug,
			adminUrl,
			redirectTo,
			purchaseId,
			feature,
			cart,
			isJetpackNotAtomic,
			productAliasFromUrl,
			isEligibleForSignupDestinationResult,
			hideNudge,
			isInModal,
			isJetpackCheckout,
			domains,
		};

		debug( 'getThankYouUrl called with', getThankYouPageUrlArguments );
		const url = getThankYouPageUrl( getThankYouPageUrlArguments );
		debug( 'getThankYouUrl returned', url );

		return url;
	}, [
		isInModal,
		isEligibleForSignupDestinationResult,
		siteSlug,
		adminUrl,
		isJetpackNotAtomic,
		productAliasFromUrl,
		redirectTo,
		feature,
		purchaseId,
		cart,
		hideNudge,
		isJetpackCheckout,
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
	isJetpackNotAtomic?: boolean;
	productAliasFromUrl?: string | undefined;
	hideNudge?: boolean;
	isInModal?: boolean;
	isJetpackCheckout?: boolean;
	domains: ResponseDomain[] | undefined;
}
