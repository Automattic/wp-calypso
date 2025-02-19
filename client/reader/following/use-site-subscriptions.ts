import { SubscriptionManager } from '@automattic/data-stores';
import { useMemo, useEffect } from 'react';

/**
 * Custom hook to manage site subscriptions data.
 * Fetches and tracks subscription counts and site subscription details,
 * filtering out self-owned blogs to determine if the user has any external subscriptions.
 * @returns {Object} An object containing:
 *   - isLoading: boolean indicating if subscription data is being loaded
 *   - hasNonSelfSubscriptions: boolean indicating if user has any subscriptions to non-self-owned blogs
 */
export function useSiteSubscriptions() {
	const { data: subscriptionsCount, isLoading: isLoadingCount } =
		SubscriptionManager.useSubscriptionsCountQuery();
	const {
		data: siteSubscriptions,
		isLoading: isLoadingSiteSubscriptions,
		refetch: refetchSiteSubscriptions,
	} = SubscriptionManager.useSiteSubscriptionsQuery();

	const isLoadingDependencies = subscriptionsCount === undefined || siteSubscriptions === undefined;
	const isLoading = isLoadingCount || isLoadingSiteSubscriptions || isLoadingDependencies;
	const blogCount = subscriptionsCount?.blogs ?? 0;

	const hasNonSelfSubscriptions = useMemo( () => {
		if ( blogCount === 0 ) {
			return false;
		}

		// If we have site subscriptions data, filter out self-owned blogs.
		// Self-owned blogs are not returned in the feed.
		if ( siteSubscriptions?.subscriptions.length > 0 ) {
			const nonSelfSubscriptions = siteSubscriptions.subscriptions.filter(
				( sub ) => ! sub.is_owner
			);
			return nonSelfSubscriptions.length > 0;
		}

		return true;
	}, [ blogCount, siteSubscriptions ] );

	useEffect( () => {
		if ( blogCount > 0 ) {
			refetchSiteSubscriptions();
		}
	}, [ refetchSiteSubscriptions, blogCount ] );

	return {
		isLoading,
		hasNonSelfSubscriptions,
	};
}
