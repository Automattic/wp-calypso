/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useIsSeenEnabled } from '../use-is-seen-enabled';
import {
	BLOG_ID,
	FEED_ID,
	organizationSubscription,
	createSeenPostsWrapper,
	subscription,
} from './fixtures';

describe( 'useIsSeenEnabled', () => {
	it( 'returns true when user is subscribed to a feed', () => {
		const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID } ), {
			wrapper: createSeenPostsWrapper( { subscriptions: [ organizationSubscription ] } ),
		} );

		expect( result.current ).toBe( true );
	} );

	it( 'returns false when user is not subscribed to a feed', () => {
		const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID + 1 } ), {
			wrapper: createSeenPostsWrapper( { subscriptions: [ organizationSubscription ] } ),
		} );

		expect( result.current ).toBe( false );
	} );

	describe( 'regular users', () => {
		it( 'returns false when user is subscribed to a feed that is not a P2', () => {
			const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID } ), {
				wrapper: createSeenPostsWrapper( { subscriptions: [ subscription ] } ),
			} );

			expect( result.current ).toBe( false );
		} );

		it( 'returns false on a P2 the user does not subscribe to', () => {
			const { result } = renderHook( () => useIsSeenEnabled( { blogId: BLOG_ID } ), {
				wrapper: createSeenPostsWrapper( { wpForTeamsBlogIds: [ BLOG_ID ] } ),
			} );

			expect( result.current ).toBe( false );
		} );

		it( 'returns true when user is subscribed to a P2 blog', () => {
			const { result } = renderHook(
				() => useIsSeenEnabled( { feedId: FEED_ID, blogId: BLOG_ID } ),
				{
					wrapper: createSeenPostsWrapper( {
						subscriptions: [ subscription ],
						wpForTeamsBlogIds: [ BLOG_ID ],
					} ),
				}
			);

			expect( result.current ).toBe( true );
		} );

		it( 'returns false for an organization feed the user no longer follows', () => {
			const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID } ), {
				wrapper: createSeenPostsWrapper( {
					subscriptions: [ { ...organizationSubscription, is_following: false } ],
				} ),
			} );

			expect( result.current ).toBe( false );
		} );

		it( 'returns true when user is subscribed to an organization feed', () => {
			const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID } ), {
				wrapper: createSeenPostsWrapper( { subscriptions: [ organizationSubscription ] } ),
			} );

			expect( result.current ).toBe( true );
		} );
	} );

	describe( 'Automatticians', () => {
		it( 'returns true when user is subscribed to a feed that is not a P2', () => {
			const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID } ), {
				wrapper: createSeenPostsWrapper( {
					subscriptions: [ subscription ],
					isAutomattician: true,
				} ),
			} );

			expect( result.current ).toBe( true );
		} );

		it( 'returns true when a user is not subscribed to a P2', () => {
			const { result } = renderHook( () => useIsSeenEnabled( { blogId: BLOG_ID } ), {
				wrapper: createSeenPostsWrapper( {
					wpForTeamsBlogIds: [ BLOG_ID ],
					isAutomattician: true,
				} ),
			} );

			expect( result.current ).toBe( true );
		} );

		it( 'returns true when a user is not subscribed to an organization feed', () => {
			const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID } ), {
				wrapper: createSeenPostsWrapper( {
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
					wrapper: createSeenPostsWrapper( {
						wpForTeamsBlogIds: [ BLOG_ID ],
						subscribedListFeedIds: [ FEED_ID + 1 ],
					} ),
				}
			);

			expect( result.current ).toBe( false );
		} );

		it( 'returns false for a non-P2 feed in a subscribed list for a regular user', () => {
			const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID } ), {
				wrapper: createSeenPostsWrapper( { subscribedListFeedIds: [ FEED_ID ] } ),
			} );

			expect( result.current ).toBe( false );
		} );

		it( 'returns true for a P2 feed in a subscribed list the regular user does not follow', () => {
			const { result } = renderHook(
				() => useIsSeenEnabled( { feedId: FEED_ID, blogId: BLOG_ID } ),
				{
					wrapper: createSeenPostsWrapper( {
						wpForTeamsBlogIds: [ BLOG_ID ],
						subscribedListFeedIds: [ FEED_ID ],
					} ),
				}
			);

			expect( result.current ).toBe( true );
		} );

		it( 'returns false for an automattician on a feed not in any subscribed list', () => {
			const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID } ), {
				wrapper: createSeenPostsWrapper( {
					isAutomattician: true,
					subscribedListFeedIds: [ FEED_ID + 1 ],
				} ),
			} );

			expect( result.current ).toBe( false );
		} );

		it( 'returns true for an automattician on any feed in a subscribed list', () => {
			const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID } ), {
				wrapper: createSeenPostsWrapper( {
					isAutomattician: true,
					subscribedListFeedIds: [ FEED_ID ],
				} ),
			} );

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
					{ wrapper: createSeenPostsWrapper( { ...eligible, route } ) }
				);

				expect( result.current ).toBe( false );
			}
		);

		it.each( [ '/activities/likes', '/reader/conversations', '/reader/conversations/a8c' ] )(
			'returns false on %s for an automattician',
			( route ) => {
				const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID } ), {
					wrapper: createSeenPostsWrapper( { isAutomattician: true, route } ),
				} );

				expect( result.current ).toBe( false );
			}
		);

		it( 'returns true on non-disabled route route when the user is otherwise eligible', () => {
			const { result } = renderHook( () => useIsSeenEnabled( { feedId: FEED_ID } ), {
				wrapper: createSeenPostsWrapper( { ...eligible, route: '/reader' } ),
			} );

			expect( result.current ).toBe( true );
		} );
	} );
} );
