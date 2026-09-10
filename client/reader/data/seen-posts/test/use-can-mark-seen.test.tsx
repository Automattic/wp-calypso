/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useCanMarkSeen } from '../use-can-mark-seen';
import {
	AUTOMATTIC_ORG_ID,
	BLOG_ID,
	FEED_ID,
	createSeenPostsWrapper,
	subscription,
} from './fixtures';
import type { Subscription } from './fixtures';

const a8cSubscription: Subscription = { ...subscription, organization_id: AUTOMATTIC_ORG_ID };
const eligible = { subscriptions: [ a8cSubscription ] };

// An AFK post satisfies both halves of the wpcom `is_automattic_private()` guard.
const afkPost = {
	organization_id: AUTOMATTIC_ORG_ID,
	site_is_private: true,
	tags: { afk: { slug: 'afk' } },
};

describe( 'useCanMarkSeen', () => {
	it( 'returns false when the seen feature is unavailable', () => {
		const { result } = renderHook( () => useCanMarkSeen( { feedId: FEED_ID } ), {
			wrapper: createSeenPostsWrapper(),
		} );

		expect( result.current ).toBe( false );
	} );

	it( 'returns true when the seen feature is available and the post is not an AFK post', () => {
		const { result } = renderHook( () => useCanMarkSeen( { feedId: FEED_ID } ), {
			wrapper: createSeenPostsWrapper( eligible ),
		} );

		expect( result.current ).toBe( true );
	} );

	it( 'returns false for an AFK post on an Automattic-private blog', () => {
		const { result } = renderHook( () => useCanMarkSeen( { feedId: FEED_ID, post: afkPost } ), {
			wrapper: createSeenPostsWrapper( eligible ),
		} );

		expect( result.current ).toBe( false );
	} );

	it( 'returns false for an AFK post the viewer does not follow', () => {
		const { result } = renderHook( () => useCanMarkSeen( { feedId: FEED_ID, post: afkPost } ), {
			wrapper: createSeenPostsWrapper( {
				isAutomattician: true,
				wpForTeamsBlogIds: [ BLOG_ID ],
			} ),
		} );

		expect( result.current ).toBe( false );
	} );

	it( 'returns true for an AFK post on a public Automattic blog', () => {
		const post = { ...afkPost, site_is_private: false };
		const { result } = renderHook( () => useCanMarkSeen( { feedId: FEED_ID, post } ), {
			wrapper: createSeenPostsWrapper( eligible ),
		} );

		expect( result.current ).toBe( true );
	} );

	it( 'returns true for a post with an unrelated tag', () => {
		const post = { ...afkPost, tags: { 'p2-xpost': { slug: 'p2-xpost' } } };
		const { result } = renderHook( () => useCanMarkSeen( { feedId: FEED_ID, post } ), {
			wrapper: createSeenPostsWrapper( eligible ),
		} );

		expect( result.current ).toBe( true );
	} );
} );
