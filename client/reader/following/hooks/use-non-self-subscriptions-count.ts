import { useMemo } from 'react';
import { useSiteSubscriptions } from 'calypso/reader/data/site-subscriptions';

/**
 * Reads the shared Reader site subscriptions data, filtering out self-owned blogs to determine if the user has any external subscriptions.
 */
export function useNonSelfSubscriptionsCount() {
	const { subscriptions = [], isLoading } = useSiteSubscriptions( { fetchAllPages: true } );

	const nonSelfSubscriptionsCount = useMemo( () => {
		return subscriptions.filter( ( sub ) => ! sub.is_owner ).length;
	}, [ subscriptions ] );

	return {
		isLoading,
		nonSelfSubscriptionsCount,
	};
}
