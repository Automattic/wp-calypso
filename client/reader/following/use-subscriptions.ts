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

	const nonSelfSubscriptions = useMemo(
		() => siteSubscriptions?.subscriptions?.filter( ( sub ) => ! sub.is_owner ) ?? [],
		[ siteSubscriptions.subscriptions ]
	);

	const hasNonSelfSubscriptions = useMemo( () => {
		if ( blogCount === 0 ) {
			return false;
		}
		return siteSubscriptions?.subscriptions ? nonSelfSubscriptions.length > 0 : blogCount > 0;
	}, [ blogCount, siteSubscriptions.subscriptions, nonSelfSubscriptions ] );

	useEffect( () => {
		if ( blogCount > 0 ) {
			refetchSiteSubscriptions();
		}
	}, [ refetchSiteSubscriptions, blogCount ] );

	return {
		isLoading,
		hasNonSelfSubscriptions,
		nonSelfSubscriptions,
		blogCount,
	};
}
