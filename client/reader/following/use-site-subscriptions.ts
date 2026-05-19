import { SubscriptionManager } from '@automattic/data-stores';
import { useMemo, useEffect, useRef } from 'react';

/**
 * Custom hook to manage site subscriptions data.
 * Fetches and tracks subscription counts and site subscription details,
 * filtering out self-owned blogs to determine if the user has any external subscriptions.
 * @returns {Object} An object containing:
 *   - isLoading: boolean indicating if subscription data is being loaded (true until
 *     the first page of subscriptions arrives — matches existing fast-render semantics
 *     for callers that want to show partial data ASAP)
 *   - hasLoadedAllSubscriptions: boolean indicating whether the infinite query has
 *     fetched every page. Only `nonSelfSubscriptionsCount` is fully accurate once this
 *     is true — callers making count-based decisions (e.g. eligibility snapshots in
 *     onboarding) should gate on it instead of `isLoading`.
 *   - hasNonSelfSubscriptions: boolean indicating if user has any subscriptions to non-self-owned blogs
 *   - nonSelfSubscriptionsCount: number of subscriptions to non-self-owned blogs across
 *     the pages loaded so far. Only exact once `hasLoadedAllSubscriptions` is true; for
 *     users with many subscriptions this grows as additional pages stream in.
 */
export function useSiteSubscriptions() {
	const { data: subscriptionsCount, isLoading: isLoadingCount } =
		SubscriptionManager.useSubscriptionsCountQuery();
	const {
		data: siteSubscriptions,
		isLoading: isLoadingSiteSubscriptions,
		hasNextPage,
		isFetching,
		isFetchingNextPage,
		refetch: refetchSiteSubscriptions,
	} = SubscriptionManager.useSiteSubscriptionsQuery();

	const isLoadingDependencies = subscriptionsCount === undefined || siteSubscriptions === undefined;
	const isLoading = isLoadingCount || isLoadingSiteSubscriptions || isLoadingDependencies;
	const blogCount = subscriptionsCount?.blogs ?? 0;

	// The hook auto-triggers a refetch on mount when `blogCount > 0` (see effect
	// below). Track whether *any* fetch — initial load or refetch — has actually
	// been observed since mount; without this, a hot TanStack Query cache
	// (warmed by another reader page in the same session) would make the hook
	// expose `hasLoadedAllSubscriptions: true` on the first render against
	// stale data, before the on-mount refetch has had a chance to flip
	// `isFetching` true. Count-sensitive callers (onboarding eligibility
	// snapshots) would then capture the pre-mount value and lock it in.
	const hasObservedFetchSinceMountRef = useRef( false );
	useEffect( () => {
		if ( isFetching || isFetchingNextPage ) {
			hasObservedFetchSinceMountRef.current = true;
		}
	}, [ isFetching, isFetchingNextPage ] );

	// When `blogCount === 0` no on-mount refetch is scheduled (the effect below
	// is a no-op) and there's nothing to wait for — the "no subs" answer is
	// already the correct one. In every other case we must have seen a fetch
	// resolve since the component mounted before declaring fully loaded.
	const hasRefreshedSinceMount = blogCount === 0 || hasObservedFetchSinceMountRef.current;

	// The underlying `useSiteSubscriptionsQuery` is an infinite query that auto-
	// paginates after page 1, so `isLoading` flips to false once the first page
	// arrives but later pages are still in flight. Callers that need the *exact*
	// non-self count (e.g. onboarding eligibility) must wait until every page
	// has been fetched — gate on this flag instead of `isLoading`.
	const hasLoadedAllSubscriptions =
		! isLoading && ! hasNextPage && ! isFetching && ! isFetchingNextPage && hasRefreshedSinceMount;

	const nonSelfSubscriptionsCount = useMemo( () => {
		if ( ! siteSubscriptions?.subscriptions ) {
			return 0;
		}
		return siteSubscriptions.subscriptions.filter( ( sub ) => ! sub.is_owner ).length;
	}, [ siteSubscriptions ] );

	const hasNonSelfSubscriptions = useMemo( () => {
		if ( blogCount === 0 ) {
			return false;
		}

		// If we have site subscriptions data, filter out self-owned blogs.
		// Self-owned blogs are not returned in the feed.
		if ( siteSubscriptions?.subscriptions.length > 0 ) {
			return nonSelfSubscriptionsCount > 0;
		}

		return true;
	}, [ blogCount, siteSubscriptions, nonSelfSubscriptionsCount ] );

	useEffect( () => {
		if ( blogCount > 0 ) {
			refetchSiteSubscriptions();
		}
	}, [ refetchSiteSubscriptions, blogCount ] );

	return {
		isLoading,
		hasLoadedAllSubscriptions,
		hasNonSelfSubscriptions,
		nonSelfSubscriptionsCount,
	};
}
