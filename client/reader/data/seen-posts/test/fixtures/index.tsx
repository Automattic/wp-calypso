import {
	getSiteSubscriptionsQueryKey,
	isAutomatticianQuery,
	readSubscribedListsQuery,
} from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { AUTOMATTIC_ORG_ID, P2_ORG_ID } from 'calypso/state/reader/organizations/constants';
import type { SiteSubscriptionItem } from '@automattic/api-core';
import type { ReactNode } from 'react';

export const USER_ID = 10;
export const FEED_ID = 200;
export const BLOG_ID = 100;
export const ORG_ID = P2_ORG_ID;

export type Subscription = Partial< SiteSubscriptionItem >;

interface SeenPostsWrapperOptions {
	subscriptions?: Subscription[];
	isAutomattician?: boolean;
	wpForTeamsBlogIds?: number[];
	subscribedListFeedIds?: number[];
	route?: string;
}

/**
 * Builds a `renderHook`/`render` wrapper with the React Query caches and Redux state for the seen-posts.
 */
export function createSeenPostsWrapper( {
	subscriptions = [],
	isAutomattician = false,
	wpForTeamsBlogIds = [],
	subscribedListFeedIds = [],
	route,
}: SeenPostsWrapperOptions = {} ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

	// `isAutomatticianQuery` is `readTeamsQuery` plus a `select`, so this seeds both.
	queryClient.setQueryData( isAutomatticianQuery().queryKey, {
		number: isAutomattician ? 1 : 0,
		teams: isAutomattician ? [ { slug: 'a8c', title: 'Automattic' } ] : [],
	} );

	queryClient.setQueryData( getSiteSubscriptionsQueryKey(), {
		pages: [ { subscriptions, totalCount: subscriptions.length } ],
		pageParams: [ 1 ],
	} );

	queryClient.setQueryData( readSubscribedListsQuery().queryKey, {
		lists: [
			{
				ID: 1,
				title: 'Test List',
				slug: 'test-list',
				description: 'A test list',
				owner: 'test-user',
				is_owner: false,
				is_public: true,
				feeds: subscribedListFeedIds.map( ( feed_id ) => ( {
					feed_id,
					unseen_count: 0,
				} ) ),
			},
		],
	} );

	const state = {
		currentUser: { id: USER_ID },
		sites: {
			items: Object.fromEntries(
				wpForTeamsBlogIds.map( ( id ) => [ id, { options: { is_wpforteams_site: true } } ] )
			),
		},
		route: { path: { current: route ?? null } },
	};
	const store = createStore( () => state );

	return function Wrapper( { children }: { children: ReactNode } ) {
		return (
			<QueryClientProvider client={ queryClient }>
				<Provider store={ store }>{ children }</Provider>
			</QueryClientProvider>
		);
	};
}

export const subscription: Subscription = {
	feed_ID: FEED_ID,
	blog_ID: BLOG_ID,
	is_following: true,
};

export const organizationSubscription: Subscription = {
	...subscription,
	organization_id: ORG_ID,
};

export { AUTOMATTIC_ORG_ID, P2_ORG_ID };
