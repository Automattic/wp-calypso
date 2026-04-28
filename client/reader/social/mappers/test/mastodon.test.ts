import { mapMastodonFeedItemToSocialPost } from '../mastodon';
import type { MastodonFeedItem } from '@automattic/api-core';

const FIXTURE: MastodonFeedItem = {
	uri: 'https://mastodon.social/@alice/12345',
	id: '12345',
	author: {
		id: '7',
		acct: 'alice@mastodon.social',
		display_name: 'Alice',
		avatar: 'https://cdn/a.jpg',
		url: 'https://mastodon.social/@alice',
	},
	created_at: '2026-04-28T10:00:00Z',
	edited_at: null,
	text: 'Hello',
	html: '<p>Hello</p>',
	lang: 'en',
	reply_parent: null,
	reply_root: null,
	reason: null,
	counts: { replies: 1, reblogs: 2, favourites: 3, quotes: 4 },
	embed: null,
};

describe( 'mapMastodonFeedItemToSocialPost', () => {
	it( 'sets permalink from uri', () => {
		const post = mapMastodonFeedItemToSocialPost( FIXTURE );
		expect( post.permalink ).toBe( 'https://mastodon.social/@alice/12345' );
	} );

	it( 'maps author identity', () => {
		const post = mapMastodonFeedItemToSocialPost( FIXTURE );
		expect( post.author ).toEqual( {
			id: '7',
			handle: 'alice@mastodon.social',
			display_name: 'Alice',
			avatar: 'https://cdn/a.jpg',
			profile_url: 'https://mastodon.social/@alice',
		} );
	} );

	it( 'renames reblogs → reposts and favourites → likes', () => {
		const post = mapMastodonFeedItemToSocialPost( FIXTURE );
		expect( post.counts ).toEqual( { replies: 1, reposts: 2, likes: 3, quotes: 4 } );
	} );

	it( 'defaults quotes to 0 when omitted', () => {
		const post = mapMastodonFeedItemToSocialPost( {
			...FIXTURE,
			counts: { replies: 0, reblogs: 0, favourites: 0 },
		} );
		expect( post.counts.quotes ).toBe( 0 );
	} );

	it( 'widens lang single-string to array', () => {
		const post = mapMastodonFeedItemToSocialPost( FIXTURE );
		expect( post.lang ).toEqual( [ 'en' ] );
	} );

	it( 'normalises lang null to empty array', () => {
		const post = mapMastodonFeedItemToSocialPost( { ...FIXTURE, lang: null } );
		expect( post.lang ).toEqual( [] );
	} );

	it( 'maps boost reason → repost', () => {
		const post = mapMastodonFeedItemToSocialPost( {
			...FIXTURE,
			reason: {
				type: 'boost',
				by: { acct: 'bob@x.tld', display_name: 'Bob', avatar: null },
			},
		} );
		expect( post.reason ).toEqual( {
			type: 'repost',
			by: { handle: 'bob@x.tld', display_name: 'Bob' },
		} );
	} );
} );
