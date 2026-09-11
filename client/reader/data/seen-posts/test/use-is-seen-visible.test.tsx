/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useIsSeenVisible } from '../use-is-seen-visible';
import { AUTOMATTIC_ORG_ID, FEED_ID, createSeenPostsWrapper, subscription } from './fixtures';
import type { Subscription } from './fixtures';

const a8cSubscription: Subscription = { ...subscription, organization_id: AUTOMATTIC_ORG_ID };
const eligible = { subscriptions: [ a8cSubscription ] };
const p2Post = { organization_id: AUTOMATTIC_ORG_ID };
const afkPost = {
	...p2Post,
	site_is_private: true,
	tags: { afk: { slug: 'afk' } },
};

describe( 'useIsSeenVisible', () => {
	it( 'returns false when the seen feature is unavailable', () => {
		const { result } = renderHook(
			() => useIsSeenVisible( { feedId: FEED_ID, post: { is_seen: true } } ),
			{ wrapper: createSeenPostsWrapper() }
		);

		expect( result.current ).toBe( false );
	} );

	it( 'returns false for an unseen post', () => {
		const { result } = renderHook(
			() => useIsSeenVisible( { feedId: FEED_ID, post: { ...p2Post, is_seen: false } } ),
			{ wrapper: createSeenPostsWrapper( eligible ) }
		);

		expect( result.current ).toBe( false );
	} );

	it( 'returns false when the post carries no seen flag', () => {
		const { result } = renderHook( () => useIsSeenVisible( { feedId: FEED_ID, post: p2Post } ), {
			wrapper: createSeenPostsWrapper( eligible ),
		} );

		expect( result.current ).toBe( false );
	} );

	it( 'returns true for a post carrying the seen flag', () => {
		const { result } = renderHook(
			() => useIsSeenVisible( { feedId: FEED_ID, post: { ...p2Post, is_seen: true } } ),
			{ wrapper: createSeenPostsWrapper( eligible ) }
		);

		expect( result.current ).toBe( true );
	} );

	describe( 'AFK posts', () => {
		it( 'returns true for an AFK post even though it cannot be marked as seen', () => {
			const { result } = renderHook( () => useIsSeenVisible( { feedId: FEED_ID, post: afkPost } ), {
				wrapper: createSeenPostsWrapper( eligible ),
			} );

			expect( result.current ).toBe( true );
		} );

		it( 'defers to the seen flag for an AFK post on a public Automattic blog', () => {
			const post = { ...afkPost, site_is_private: false, is_seen: false };
			const { result } = renderHook( () => useIsSeenVisible( { feedId: FEED_ID, post } ), {
				wrapper: createSeenPostsWrapper( eligible ),
			} );

			expect( result.current ).toBe( false );
		} );
	} );
} );
