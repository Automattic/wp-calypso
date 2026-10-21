import { socialPostFeedItemKey } from '../social-post-feed-item-key';
import type { SocialPost } from '../../types';

const basePost = ( overrides: Partial< SocialPost > = {} ): SocialPost =>
	( {
		uri: 'at://did:plc:original/app.bsky.feed.post/abc',
		permalink: 'https://bsky.app/profile/foo/post/abc',
		text: '',
		html: '',
		created_at: '2026-01-01T00:00:00Z',
		indexed_at: null,
		lang: [],
		author: {
			id: 'did:plc:original',
			handle: 'foo.bsky.social',
			display_name: 'Foo',
			avatar: null,
			profile_url: 'https://bsky.app/profile/foo.bsky.social',
		},
		reply_parent: null,
		reply_root: null,
		reason: null,
		embed: null,
		...overrides,
	} ) as SocialPost;

describe( 'socialPostFeedItemKey', () => {
	it( 'returns the post uri when reason is null', () => {
		const post = basePost();
		expect( socialPostFeedItemKey( post ) ).toBe( post.uri );
	} );

	it( 'composes a distinct key per reposter so the same post via different reposters does not collide', () => {
		const post = basePost();
		const reposterA = basePost( {
			reason: {
				type: 'repost',
				by: { id: 'did:plc:alice', handle: 'alice.bsky.social', display_name: 'Alice' },
			},
		} );
		const reposterB = basePost( {
			reason: {
				type: 'repost',
				by: { id: 'did:plc:bob', handle: 'bob.bsky.social', display_name: 'Bob' },
			},
		} );

		const keys = [
			socialPostFeedItemKey( post ),
			socialPostFeedItemKey( reposterA ),
			socialPostFeedItemKey( reposterB ),
		];
		expect( new Set( keys ).size ).toBe( 3 );
	} );

	it( 'falls back to the reposter handle when the reposter id is missing', () => {
		const post = basePost( {
			reason: {
				type: 'repost',
				by: { handle: 'alice.example', display_name: 'Alice' },
			},
		} );
		expect( socialPostFeedItemKey( post ) ).toBe(
			'repost:alice.example:at://did:plc:original/app.bsky.feed.post/abc'
		);
	} );
} );
