import { SubscriptionManager } from '@automattic/data-stores';
import { useMemo, useEffect } from 'react';

export function useSubscriptions() {
	const { data: subscriptionsCount, isLoading: isLoadingCount } =
		SubscriptionManager.useSubscriptionsCountQuery();
	const {
		data: siteSubscriptions,
		isLoading: isLoadingSiteSubscriptions,
		refetch: refetchSiteSubscriptions,
	} = SubscriptionManager.useSiteSubscriptionsQuery();

	const isLoading = isLoadingCount || isLoadingSiteSubscriptions;
	const blogCount = subscriptionsCount?.blogs ?? 0;

	const hasNonSelfSubscriptions = useMemo( () => {
		if ( blogCount === 0 ) {
			return false;
		}

		// If we have site subscriptions data, filter out self-owned blogs.
		if ( siteSubscriptions?.subscriptions ) {
			const nonSelfSubscriptions = siteSubscriptions.subscriptions.filter(
				( sub ) => ! sub.is_owner
			);
			return nonSelfSubscriptions.length > 0;
		}

		return blogCount > 0;
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
