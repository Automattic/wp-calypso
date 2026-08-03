/**
 * @jest-environment jsdom
 */
import { getSiteSubscriptionsQueryKey, isAutomatticianQuery } from '@automattic/api-queries';
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
}

function setUp( {
	subscriptions = [],
	isAutomattician = false,
	wpForTeamsBlogIds = [],
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

	const state = {
		currentUser: { id: USER_ID },
		sites: {
			items: Object.fromEntries(
				wpForTeamsBlogIds.map( ( id ) => [ id, { options: { is_wpforteams_site: true } } ] )
			),
		},
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

	describe( 'post shape', () => {
		const eligible = { subscriptions: [ organizationSubscription ] };

		it( 'returns false for a post returned without the seen flag', () => {
			const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID, post: {} } ), {
				wrapper: setUp( eligible ),
			} );

			expect( result.current ).toBe( false );
		} );

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
} );
