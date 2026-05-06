import { mapMastodonFeedItemToSocialPost } from '../mastodon';
import type { MastodonFeedItem } from '@automattic/api-core';

const FIXTURE: MastodonFeedItem = {
	id: '111111111111111111',
	url: 'https://mastodon.social/@alice/111111111111111111',
	created_at: '2026-04-28T10:00:00Z',
	account: {
		id: '7',
		username: 'alice',
		acct: 'alice',
		display_name: 'Alice',
		avatar: 'https://cdn/a.jpg',
	},
	content: '<p>Hello</p>',
	spoiler_text: '',
	sensitive: false,
	language: 'en',
	in_reply_to_id: null,
	in_reply_to_account_id: null,
	boost: null,
	media: [],
	counts: { replies: 1, boosts: 2, favourites: 3 },
};

const OPTS = { instance: 'mastodon.social' };

describe( 'mapMastodonFeedItemToSocialPost', () => {
	it( 'sets uri from id and permalink from url', () => {
		const post = mapMastodonFeedItemToSocialPost( FIXTURE, OPTS );
		// uri must be the status id so two boosts of the same post (sharing
		// `url`) produce distinct React keys.
		expect( post.uri ).toBe( '111111111111111111' );
		expect( post.permalink ).toBe( 'https://mastodon.social/@alice/111111111111111111' );
	} );

	it( 'omits content_warning when sensitive is false', () => {
		const post = mapMastodonFeedItemToSocialPost( FIXTURE, OPTS );
		expect( post.content_warning ).toBeUndefined();
	} );

	it( 'surfaces content_warning with spoiler text when sensitive is true', () => {
		const post = mapMastodonFeedItemToSocialPost(
			{ ...FIXTURE, sensitive: true, spoiler_text: 'NSFW' },
			OPTS
		);
		expect( post.content_warning ).toEqual( { sensitive: true, spoiler_text: 'NSFW' } );
	} );

	it( 'surfaces content_warning with empty spoiler when sensitive is true with no reason', () => {
		const post = mapMastodonFeedItemToSocialPost(
			{ ...FIXTURE, sensitive: true, spoiler_text: '' },
			OPTS
		);
		expect( post.content_warning ).toEqual( { sensitive: true, spoiler_text: '' } );
	} );

	it( 'qualifies a local acct with the connection instance', () => {
		const post = mapMastodonFeedItemToSocialPost( FIXTURE, OPTS );
		expect( post.author.handle ).toBe( 'alice@mastodon.social' );
		expect( post.author.profile_url ).toBe( 'https://mastodon.social/@alice' );
	} );

	it( 'preserves a remote (already-qualified) acct as-is', () => {
		const post = mapMastodonFeedItemToSocialPost(
			{
				...FIXTURE,
				account: { ...FIXTURE.account, acct: 'carol@infosec.exchange' },
			},
			OPTS
		);
		expect( post.author.handle ).toBe( 'carol@infosec.exchange' );
		// profile_url points directly at the remote instance — no
		// redirect through the connection's home instance.
		expect( post.author.profile_url ).toBe( 'https://infosec.exchange/@carol' );
	} );

	it( 'renames boosts → reposts and favourites → likes; defaults quotes to 0', () => {
		const post = mapMastodonFeedItemToSocialPost( FIXTURE, OPTS );
		expect( post.counts ).toEqual( { replies: 1, reposts: 2, likes: 3, quotes: 0 } );
	} );

	it( 'maps content to html (not text)', () => {
		const post = mapMastodonFeedItemToSocialPost( FIXTURE, OPTS );
		expect( post.html ).toBe( '<p>Hello</p>' );
		expect( post.text ).toBe( '' );
	} );

	it( 'wraps language single-string into array; null becomes empty array', () => {
		expect( mapMastodonFeedItemToSocialPost( FIXTURE, OPTS ).lang ).toEqual( [ 'en' ] );
		expect( mapMastodonFeedItemToSocialPost( { ...FIXTURE, language: null }, OPTS ).lang ).toEqual(
			[]
		);
	} );

	it( 'maps boost → repost reason with qualified acct', () => {
		const post = mapMastodonFeedItemToSocialPost(
			{
				...FIXTURE,
				boost: {
					type: 'boost',
					by: {
						id: '8',
						username: 'bob',
						acct: 'bob',
						display_name: 'Bob',
						avatar: null,
					},
				},
			},
			OPTS
		);
		expect( post.reason ).toEqual( {
			type: 'repost',
			by: { id: '8', handle: 'bob@mastodon.social', display_name: 'Bob' },
		} );
	} );

	it( 'omits viewer when item.viewer is absent', () => {
		const post = mapMastodonFeedItemToSocialPost( FIXTURE, OPTS );
		expect( post.viewer ).toBeUndefined();
	} );

	it( 'sets viewer.repost to "reblogged" when viewer.reblogged is true', () => {
		const post = mapMastodonFeedItemToSocialPost(
			{ ...FIXTURE, viewer: { favourited: false, reblogged: true } },
			OPTS
		);
		expect( post.viewer?.repost ).toBe( 'reblogged' );
		expect( post.viewer?.like ).toBeNull();
	} );

	it( 'sets viewer.like to "favorited" when viewer.favourited is true', () => {
		const post = mapMastodonFeedItemToSocialPost(
			{ ...FIXTURE, viewer: { favourited: true, reblogged: false } },
			OPTS
		);
		expect( post.viewer?.like ).toBe( 'favorited' );
		expect( post.viewer?.repost ).toBeNull();
	} );

	it( 'sets viewer.repost to null when viewer.reblogged is false', () => {
		const post = mapMastodonFeedItemToSocialPost(
			{ ...FIXTURE, viewer: { favourited: false, reblogged: false } },
			OPTS
		);
		expect( post.viewer?.repost ).toBeNull();
	} );

	it( 'returns null embed when media[] is empty', () => {
		const post = mapMastodonFeedItemToSocialPost( FIXTURE, OPTS );
		expect( post.embed ).toBeNull();
	} );

	it( 'maps a single image attachment to an images embed', () => {
		const post = mapMastodonFeedItemToSocialPost(
			{
				...FIXTURE,
				media: [
					{
						type: 'image',
						url: 'https://cdn/big.jpg',
						preview_url: 'https://cdn/small.jpg',
						alt: 'a cat',
						aspect_ratio: { width: 1920, height: 1080 },
					},
				],
			},
			OPTS
		);
		expect( post.embed ).toEqual( {
			type: 'images',
			images: [
				{
					thumb: 'https://cdn/small.jpg',
					fullsize: 'https://cdn/big.jpg',
					alt: 'a cat',
					aspect_ratio: { width: 1920, height: 1080 },
				},
			],
		} );
	} );

	it( 'groups multiple image attachments into one embed', () => {
		const post = mapMastodonFeedItemToSocialPost(
			{
				...FIXTURE,
				media: [
					{
						type: 'image',
						url: 'a',
						preview_url: 'a-small',
						alt: '',
						aspect_ratio: null,
					},
					{
						type: 'image',
						url: 'b',
						preview_url: null,
						alt: '',
						aspect_ratio: null,
					},
				],
			},
			OPTS
		);
		expect( post.embed?.type ).toBe( 'images' );
		expect( ( post.embed as { type: 'images'; images: unknown[] } ).images ).toHaveLength( 2 );
	} );

	it( 'maps a video attachment to a video embed', () => {
		const post = mapMastodonFeedItemToSocialPost(
			{
				...FIXTURE,
				media: [
					{
						type: 'video',
						url: 'https://cdn/v.mp4',
						preview_url: 'https://cdn/v.jpg',
						alt: '',
						aspect_ratio: { width: 16, height: 9 },
					},
				],
			},
			OPTS
		);
		expect( post.embed ).toEqual( {
			type: 'video',
			playlist: 'https://cdn/v.mp4',
			thumbnail: 'https://cdn/v.jpg',
			alt: '',
			aspect_ratio: { width: 16, height: 9 },
		} );
	} );

	it( 'images take priority over video when both are present', () => {
		const post = mapMastodonFeedItemToSocialPost(
			{
				...FIXTURE,
				media: [
					{ type: 'video', url: 'v', preview_url: null, alt: '', aspect_ratio: null },
					{ type: 'image', url: 'i', preview_url: null, alt: '', aspect_ratio: null },
				],
			},
			OPTS
		);
		expect( post.embed?.type ).toBe( 'images' );
	} );

	describe( 'viewer translation', () => {
		it( 'sets viewer.like to "favorited" when viewer.favourited is true', () => {
			const post = mapMastodonFeedItemToSocialPost(
				{ ...FIXTURE, viewer: { favourited: true, reblogged: false } },
				OPTS
			);
			expect( post.viewer?.like ).toBe( 'favorited' );
		} );

		it( 'sets viewer.like to null when viewer.favourited is false', () => {
			const post = mapMastodonFeedItemToSocialPost(
				{ ...FIXTURE, viewer: { favourited: false, reblogged: false } },
				OPTS
			);
			expect( post.viewer?.like ).toBeNull();
		} );

		it( 'sets viewer.repost to "reblogged" when viewer.reblogged is true', () => {
			const post = mapMastodonFeedItemToSocialPost(
				{ ...FIXTURE, viewer: { favourited: false, reblogged: true } },
				OPTS
			);
			expect( post.viewer?.repost ).toBe( 'reblogged' );
		} );

		it( 'sets viewer.repost to null when viewer.reblogged is false', () => {
			const post = mapMastodonFeedItemToSocialPost(
				{ ...FIXTURE, viewer: { favourited: false, reblogged: false } },
				OPTS
			);
			expect( post.viewer?.repost ).toBeNull();
		} );

		it( 'leaves post.viewer undefined when item.viewer is undefined', () => {
			// FIXTURE has no viewer field — verify the block is absent
			const post = mapMastodonFeedItemToSocialPost( FIXTURE, OPTS );
			expect( post.viewer ).toBeUndefined();
		} );
	} );
} );
