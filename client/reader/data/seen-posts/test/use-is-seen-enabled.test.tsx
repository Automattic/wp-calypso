/**
 * @jest-environment jsdom
 */
import {
	getSiteSubscriptionsQueryKey,
	isAutomatticianQuery,
	readSubscribedListsQuery,
} from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { useIsSeenEnabled } from '../use-is-seen-enabled';
import type { SiteSubscriptionItem } from '@automattic/api-core';
import type { ReactNode } from 'react';

const USER_ID = 10;
const FEED_ID = 200;
const BLOG_ID = 100;
const ORG_ID = 4;

type Subscription = Partial< SiteSubscriptionItem >;

interface SetUp {
	subscriptions?: Subscription[];
	isAutomattician?: boolean;
	wpForTeamsBlogIds?: number[];
	subscribedListFeedIds?: number[];
	route?: string;
}

function setUp( {
	subscriptions = [],
	isAutomattician = false,
	wpForTeamsBlogIds = [],
	subscribedListFeedIds = [],
	route,
}: SetUp = {} ) {
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

const subscription: Subscription = {
	feed_ID: FEED_ID,
	blog_ID: BLOG_ID,
	is_following: true,
};

const organizationSubscription: Subscription = {
	...subscription,
	organization_id: ORG_ID,
};

describe( 'useIsSeenEnabled', () => {
	it( 'returns true when user is subscribed to a feed', () => {
		const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID } ), {
			wrapper: setUp( { subscriptions: [ organizationSubscription ] } ),
		} );

		expect( result.current ).toBe( true );
	} );

	it( 'returns false when user is not subscribed to a feed', () => {
		const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID + 1 } ), {
			wrapper: setUp( { subscriptions: [ organizationSubscription ] } ),
		} );

		expect( result.current ).toBe( false );
	} );

	describe( 'regular users', () => {
		it( 'returns false when user is subscribed to a feed that is not a P2', () => {
			const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID } ), {
				wrapper: setUp( { subscriptions: [ subscription ] } ),
			} );

			expect( result.current ).toBe( false );
		} );

		it( 'returns false on a P2 the user does not subscribe to', () => {
			const { result } = renderHook( () => useIsSeenEnabled( { blogId: BLOG_ID } ), {
				wrapper: setUp( { wpForTeamsBlogIds: [ BLOG_ID ] } ),
			} );

			expect( result.current ).toBe( false );
		} );

		it( 'returns true when user is subscribed to a P2 blog', () => {
			const { result } = renderHook(
				() => useIsSeenEnabled( { feedId: FEED_ID, blogId: BLOG_ID } ),
				{
					wrapper: setUp( { subscriptions: [ subscription ], wpForTeamsBlogIds: [ BLOG_ID ] } ),
				}
			);

			expect( result.current ).toBe( true );
		} );

		it( 'returns false for an organization feed the user no longer follows', () => {
			const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID } ), {
				wrapper: setUp( {
					subscriptions: [ { ...organizationSubscription, is_following: false } ],
				} ),
			} );

			expect( result.current ).toBe( false );
		} );

		it( 'returns true when user is subscribed to an organization feed', () => {
			const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID } ), {
				wrapper: setUp( { subscriptions: [ organizationSubscription ] } ),
			} );

			expect( result.current ).toBe( true );
		} );
	} );

	describe( 'Automatticians', () => {
		it( 'returns true when user is subscribed to a feed that is not a P2', () => {
			const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID } ), {
				wrapper: setUp( { subscriptions: [ subscription ], isAutomattician: true } ),
			} );

			expect( result.current ).toBe( true );
		} );

		it( 'returns true when a user is not subscribed to a P2', () => {
			const { result } = renderHook( () => useIsSeenEnabled( { blogId: BLOG_ID } ), {
				wrapper: setUp( { wpForTeamsBlogIds: [ BLOG_ID ], isAutomattician: true } ),
			} );

			expect( result.current ).toBe( true );
		} );

		it( 'returns true when a user is not subscribed to an organization feed', () => {
			const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID } ), {
				wrapper: setUp( {
					subscriptions: [ { ...organizationSubscription, is_following: false } ],
					isAutomattician: true,
				} ),
			} );

			expect( result.current ).toBe( true );
		} );
	} );

	describe( 'subscribed lists', () => {
		it( 'returns false for a P2 feed not in any subscribed list', () => {
			const { result } = renderHook(
				() => useIsSeenEnabled( { feedId: FEED_ID, blogId: BLOG_ID } ),
				{
					wrapper: setUp( {
						wpForTeamsBlogIds: [ BLOG_ID ],
						subscribedListFeedIds: [ FEED_ID + 1 ],
					} ),
				}
			);

			expect( result.current ).toBe( false );
		} );

		it( 'returns false for a non-P2 feed in a subscribed list for a regular user', () => {
			const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID } ), {
				wrapper: setUp( { subscribedListFeedIds: [ FEED_ID ] } ),
			} );

			expect( result.current ).toBe( false );
		} );

		it( 'returns true for a P2 feed in a subscribed list the regular user does not follow', () => {
			const { result } = renderHook(
				() => useIsSeenEnabled( { feedId: FEED_ID, blogId: BLOG_ID } ),
				{
					wrapper: setUp( {
						wpForTeamsBlogIds: [ BLOG_ID ],
						subscribedListFeedIds: [ FEED_ID ],
					} ),
				}
			);

			expect( result.current ).toBe( true );
		} );

		it( 'returns false for an automattician on a feed not in any subscribed list', () => {
			const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID } ), {
				wrapper: setUp( { isAutomattician: true, subscribedListFeedIds: [ FEED_ID + 1 ] } ),
			} );

			expect( result.current ).toBe( false );
		} );

		it( 'returns true for an automattician on any feed in a subscribed list', () => {
			const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID } ), {
				wrapper: setUp( { isAutomattician: true, subscribedListFeedIds: [ FEED_ID ] } ),
			} );

			expect( result.current ).toBe( true );
		} );
	} );

	describe( 'post shape', () => {
		const eligible = { subscriptions: [ organizationSubscription ] };

		it( 'returns true for an usubscribed post carrying the seen flag', () => {
			const { result } = renderHook(
				() => useIsSeenEnabled( { feedId: FEED_ID, post: { is_seen: false } } ),
				{ wrapper: setUp() }
			);

			expect( result.current ).toBe( false );
		} );

		it( 'returns true for a subscribed post carrying the seen flag', () => {
			const { result } = renderHook(
				() => useIsSeenEnabled( { feedId: FEED_ID, post: { is_seen: false } } ),
				{ wrapper: setUp( eligible ) }
			);

			expect( result.current ).toBe( true );
		} );
	} );

	describe( 'disabled routes', () => {
		const eligible = { subscriptions: [ organizationSubscription ] };

		it.each( [ '/activities/likes', '/reader/conversations', '/reader/conversations/a8c' ] )(
			'returns false on %s even when the post already carries the seen flag',
			( route ) => {
				const { result } = renderHook(
					() => useIsSeenEnabled( { feedId: FEED_ID, post: { is_seen: true } } ),
					{ wrapper: setUp( { ...eligible, route } ) }
				);

				expect( result.current ).toBe( false );
			}
		);

		it.each( [ '/activities/likes', '/reader/conversations', '/reader/conversations/a8c' ] )(
			'returns false on %s for an automattician',
			( route ) => {
				const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID } ), {
					wrapper: setUp( { isAutomattician: true, route } ),
				} );

				expect( result.current ).toBe( false );
			}
		);

		it( 'returns true on non-disabled route route when the user is otherwise eligible', () => {
			const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID } ), {
				wrapper: setUp( { ...eligible, route: '/reader' } ),
			} );

			expect( result.current ).toBe( true );
		} );
	} );
} );
