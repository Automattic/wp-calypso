import { mapAtmosphereFeedItemToSocialPost } from '../atmosphere';
import type { AtmosphereFeedItem } from '@automattic/api-core';

const FIXTURE: AtmosphereFeedItem = {
	uri: 'at://did:plc:a/app.bsky.feed.post/abc',
	cid: 'cid-1',
	author: {
		did: 'did:plc:a',
		handle: 'alice.bsky.social',
		display_name: 'Alice',
		avatar: 'https://cdn/a.jpg',
	},
	created_at: '2026-04-28T10:00:00Z',
	indexed_at: '2026-04-28T10:00:01Z',
	text: 'Hello',
	html: '<p>Hello</p>',
	lang: [ 'en' ],
	reply_parent: null,
	reply_root: null,
	reason: null,
	embed: null,
	counts: { replies: 1, reposts: 2, likes: 3, quotes: 4 },
	bluesky_url: 'https://bsky.app/profile/alice.bsky.social/post/abc',
};

describe( 'mapAtmosphereFeedItemToSocialPost', () => {
	it( 'maps permalink from bluesky_url', () => {
		const post = mapAtmosphereFeedItemToSocialPost( FIXTURE );
		expect( post.permalink ).toBe( 'https://bsky.app/profile/alice.bsky.social/post/abc' );
	} );

	it( 'maps author identity', () => {
		const post = mapAtmosphereFeedItemToSocialPost( FIXTURE );
		expect( post.author ).toEqual( {
			id: 'did:plc:a',
			handle: 'alice.bsky.social',
			display_name: 'Alice',
			avatar: 'https://cdn/a.jpg',
			profile_url: 'https://bsky.app/profile/alice.bsky.social',
		} );
	} );

	it( 'preserves counts', () => {
		const post = mapAtmosphereFeedItemToSocialPost( FIXTURE );
		expect( post.counts ).toEqual( { replies: 1, reposts: 2, likes: 3, quotes: 4 } );
	} );

	it( 'preserves reply_root and reply_parent strong-ref CIDs', () => {
		const post = mapAtmosphereFeedItemToSocialPost( {
			...FIXTURE,
			reply_parent: {
				uri: 'at://did:plc:b/app.bsky.feed.post/parent',
				cid: 'cid-parent',
				author: { did: 'did:plc:b', handle: 'bob.bsky.social' },
			},
			reply_root: {
				uri: 'at://did:plc:c/app.bsky.feed.post/root',
				cid: 'cid-root',
				author: { did: 'did:plc:c', handle: 'carol.bsky.social' },
			},
		} );
		expect( post.reply_parent ).toEqual( {
			uri: 'at://did:plc:b/app.bsky.feed.post/parent',
			cid: 'cid-parent',
			author: { handle: 'bob.bsky.social' },
		} );
		expect( post.reply_root ).toEqual( {
			uri: 'at://did:plc:c/app.bsky.feed.post/root',
			cid: 'cid-root',
			author: { handle: 'carol.bsky.social' },
		} );
	} );

	it( 'tolerates reply refs without a cid (older backend payloads)', () => {
		const post = mapAtmosphereFeedItemToSocialPost( {
			...FIXTURE,
			reply_parent: {
				uri: 'at://did:plc:b/app.bsky.feed.post/parent',
				author: { did: 'did:plc:b', handle: 'bob.bsky.social' },
			},
			reply_root: {
				uri: 'at://did:plc:c/app.bsky.feed.post/root',
				author: { did: 'did:plc:c', handle: 'carol.bsky.social' },
			},
		} );
		expect( post.reply_parent?.cid ).toBeUndefined();
		expect( post.reply_root?.cid ).toBeUndefined();
	} );
} );
