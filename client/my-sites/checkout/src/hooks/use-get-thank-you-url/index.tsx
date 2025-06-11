import debugFactory from 'debug';
import { useCallback } from 'react';
import getThankYouPageUrl from 'calypso/my-sites/checkout/get-thank-you-page-url';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { SitelessCheckoutType } from '@automattic/wpcom-checkout';
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
	sitelessCheckoutType,
	isJetpackNotAtomic,
	isGravatarDomain,
	productAliasFromUrl,
	hideNudge,
	isInModal,
	domains,
	connectAfterCheckout,
	adminUrl: wpAdminUrl,
	fromSiteSlug,
}: GetThankYouUrlProps ): GetThankYouUrl {
	const selectedSiteData = useSelector( getSelectedSite );

	const adminUrl = selectedSiteData?.options?.admin_url || wpAdminUrl;

	const getThankYouUrl = useCallback( () => {
		const getThankYouPageUrlArguments: PostCheckoutUrlArguments = {
			siteSlug,
			adminUrl,
			redirectTo,
			purchaseId,
			feature,
			cart,
			sitelessCheckoutType,
			isJetpackNotAtomic,
			isGravatarDomain,
			productAliasFromUrl,
			hideNudge,
			isInModal,
			domains,
			connectAfterCheckout,
			fromSiteSlug,
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
		isGravatarDomain,
		productAliasFromUrl,
		redirectTo,
		feature,
		purchaseId,
		cart,
		hideNudge,
		sitelessCheckoutType,
		domains,
		connectAfterCheckout,
		fromSiteSlug,
	] );
	return getThankYouUrl;
}

export interface GetThankYouUrlProps {
	siteSlug: string | undefined;
	redirectTo?: string | undefined;
	purchaseId?: number | string | undefined;
	feature?: string | undefined;
	cart: ResponseCart;
	sitelessCheckoutType: SitelessCheckoutType;
	productAliasFromUrl?: string | undefined;
	hideNudge?: boolean;
	isInModal?: boolean;
	isJetpackNotAtomic?: boolean;
	isGravatarDomain?: boolean;
	domains: ResponseDomain[] | undefined;
	connectAfterCheckout?: boolean;
	adminUrl?: string;
	/**
	 * `fromSiteSlug` is the Jetpack site slug passed from the site via url query arg (into
	 * checkout), for use cases when the site slug cannot be retrieved from state, ie- when there
	 * is not a site in context, such as in siteless checkout. As opposed to `siteSlug` which is
	 * the site slug present when the site is in context (ie- when site is connected and user is
	 * logged in).
	 */
	fromSiteSlug?: string;
}
