import {
	mapFediverseAuthorProfileToSocialProfileCardProps,
	mapFediverseConnectionToSocialProfileCardProps,
	mapFediverseFeedItemToSocialPost,
	stripLeadingAt,
} from '../mappers/fediverse';
import type {
	FediverseAuthorProfile,
	FediverseConnection,
	FediverseFeedItem,
	FediverseMediaAttachment,
	FediverseTimelineAccount,
} from '@automattic/api-core';

function makeAccount(
	overrides: Partial< FediverseTimelineAccount > = {}
): FediverseTimelineAccount {
	return {
		id: '200',
		username: 'alice',
		acct: 'alice',
		display_name: 'Alice',
		avatar: null,
		...overrides,
	};
}

function makeItem( overrides: Partial< FediverseFeedItem > = {} ): FediverseFeedItem {
	return {
		id: 'post-1',
		url: 'https://example.com/users/alice/statuses/1',
		created_at: '2026-05-08T10:00:00Z',
		account: makeAccount(),
		content: '<p>Hello world</p>',
		spoiler_text: '',
		sensitive: false,
		language: 'en',
		in_reply_to_id: null,
		in_reply_to_account_id: null,
		boost: null,
		media: [],
		counts: { replies: 0, boosts: 0, favourites: 0 },
		...overrides,
	};
}

function makeProfile( overrides: Partial< FediverseAuthorProfile > = {} ): FediverseAuthorProfile {
	return {
		id: 'https://example.com/users/alice',
		username: 'alice',
		acct: '@alice@example.com',
		handle: '@alice@example.com',
		instance: 'example.com',
		display_name: 'Alice',
		note: '<p>About Alice</p>',
		avatar: 'https://example.com/avatars/alice.png',
		header: 'https://example.com/banners/alice.png',
		url: 'https://example.com/@alice',
		locked: false,
		counts: { followers: 10, following: 5, posts: 42 },
		viewer: { following: false, followed_by: false, requested: false },
		is_self: false,
		...overrides,
	};
}

describe( 'stripLeadingAt', () => {
	it( 'removes a leading `@`', () => {
		expect( stripLeadingAt( '@alice@example.com' ) ).toBe( 'alice@example.com' );
	} );

	it( 'leaves a string without leading `@` unchanged', () => {
		expect( stripLeadingAt( 'alice@example.com' ) ).toBe( 'alice@example.com' );
	} );

	it( 'leaves a bare local handle unchanged', () => {
		expect( stripLeadingAt( 'alice' ) ).toBe( 'alice' );
	} );

	it( 'returns an empty string when input is empty', () => {
		expect( stripLeadingAt( '' ) ).toBe( '' );
	} );
} );

describe( 'mapFediverseFeedItemToSocialPost', () => {
	it( 'maps a basic note onto SocialPost shape', () => {
		const post = mapFediverseFeedItemToSocialPost( makeItem(), { host: 'example.com' } );
		expect( post.uri ).toBe( 'post-1' );
		expect( post.permalink ).toBe( 'https://example.com/users/alice/statuses/1' );
		expect( post.html ).toBe( '<p>Hello world</p>' );
		expect( post.lang ).toEqual( [ 'en' ] );
		expect( post.author.handle ).toBe( 'alice@example.com' );
		expect( post.author.display_name ).toBe( 'Alice' );
		expect( post.reason ).toBeNull();
		expect( post.embed ).toBeNull();
	} );

	it( 'qualifies bare local `acct` with the connection host', () => {
		const post = mapFediverseFeedItemToSocialPost(
			makeItem( { account: makeAccount( { acct: 'alice' } ) } ),
			{ host: 'myblog.test' }
		);
		expect( post.author.handle ).toBe( 'alice@myblog.test' );
		// Local profile_url uses the connection host.
		expect( post.author.profile_url ).toBe( 'https://myblog.test/@alice' );
	} );

	it( 'keeps remote `acct` as-is (already user@host)', () => {
		const post = mapFediverseFeedItemToSocialPost(
			makeItem( { account: makeAccount( { acct: 'carol@remote.example' } ) } ),
			{ host: 'myblog.test' }
		);
		expect( post.author.handle ).toBe( 'carol@remote.example' );
		// Remote profile_url targets the remote host directly, not the connection.
		expect( post.author.profile_url ).toBe( 'https://remote.example/@carol' );
	} );

	it( 'projects the boost activity onto `reason: { type: "repost" }`', () => {
		const post = mapFediverseFeedItemToSocialPost(
			makeItem( {
				boost: {
					type: 'boost',
					by: makeAccount( { id: '300', acct: 'bob@example.com', display_name: 'Bob' } ),
				},
			} ),
			{ host: 'example.com' }
		);
		expect( post.reason ).toEqual( {
			type: 'repost',
			by: { id: '300', handle: 'bob@example.com', display_name: 'Bob' },
		} );
	} );

	it( 'projects boolean viewer flags onto the SocialPost viewer shape', () => {
		const post = mapFediverseFeedItemToSocialPost(
			makeItem( { viewer: { favourited: true, reblogged: false } } ),
			{ host: 'example.com' }
		);
		expect( post.viewer ).toEqual( { like: 'favorited', repost: null } );
	} );

	it( 'leaves viewer absent when wire viewer is missing', () => {
		const post = mapFediverseFeedItemToSocialPost( makeItem(), { host: 'example.com' } );
		expect( post.viewer ).toBeUndefined();
	} );

	it( 'attaches content_warning when spoiler_text or sensitive is set', () => {
		const post = mapFediverseFeedItemToSocialPost(
			makeItem( { spoiler_text: 'spoilers', sensitive: false } ),
			{ host: 'example.com' }
		);
		expect( post.content_warning ).toEqual( { spoiler_text: 'spoilers', sensitive: false } );
	} );

	it( 'projects an image attachment onto SocialEmbedImages', () => {
		const media: FediverseMediaAttachment[] = [
			{
				type: 'image',
				url: 'https://example.com/img.jpg',
				preview_url: 'https://example.com/img-thumb.jpg',
				alt: 'a picture',
				aspect_ratio: { width: 4, height: 3 },
			},
		];
		const post = mapFediverseFeedItemToSocialPost( makeItem( { media } ), {
			host: 'example.com',
		} );
		expect( post.embed ).toEqual( {
			type: 'images',
			images: [
				{
					thumb: 'https://example.com/img-thumb.jpg',
					fullsize: 'https://example.com/img.jpg',
					alt: 'a picture',
					aspect_ratio: { width: 4, height: 3 },
				},
			],
		} );
	} );

	it( 'returns null embed when media array is empty', () => {
		const post = mapFediverseFeedItemToSocialPost( makeItem( { media: [] } ), {
			host: 'example.com',
		} );
		expect( post.embed ).toBeNull();
	} );
} );

describe( 'mapFediverseAuthorProfileToSocialProfileCardProps', () => {
	it( 'projects profile onto the card shape and strips the leading `@` from `handle`', () => {
		const card = mapFediverseAuthorProfileToSocialProfileCardProps( makeProfile(), {
			host: 'example.com',
		} );
		expect( card.avatar ).toBe( 'https://example.com/avatars/alice.png' );
		expect( card.banner ).toBe( 'https://example.com/banners/alice.png' );
		expect( card.displayName ).toBe( 'Alice' );
		expect( card.handle ).toBe( 'alice@example.com' );
		expect( card.bioHtml ).toBe( '<p>About Alice</p>' );
	} );

	it( 'falls back to profile.instance when no host option is supplied', () => {
		// Bare local handle on the wire (no `@host` suffix) — the mapper
		// qualifies via the host argument or, if absent, the profile's
		// own `instance` field.
		const card = mapFediverseAuthorProfileToSocialProfileCardProps(
			makeProfile( { acct: '@alice', handle: '@alice' } )
		);
		expect( card.handle ).toBe( 'alice@example.com' );
	} );

	it( 'leaves displayName undefined when wire display_name is empty', () => {
		// Empty display_name → the card falls back to handle.
		const card = mapFediverseAuthorProfileToSocialProfileCardProps(
			makeProfile( { display_name: '' } ),
			{ host: 'example.com' }
		);
		expect( card.displayName ).toBeUndefined();
	} );
} );

describe( 'mapFediverseConnectionToSocialProfileCardProps', () => {
	function makeConnection( overrides: Partial< FediverseConnection > = {} ): FediverseConnection {
		return {
			id: 7,
			blog_id: 700,
			url: 'https://myblog.test',
			name: 'My Blog',
			icon: 'https://myblog.test/icon.png',
			webfinger: '@myblog@myblog.test',
			...overrides,
		};
	}

	it( 'projects the connection onto the slim profile-card shape, stripping the leading `@` from the handle', () => {
		const card = mapFediverseConnectionToSocialProfileCardProps( makeConnection() );
		expect( card.avatar ).toBe( 'https://myblog.test/icon.png' );
		expect( card.displayName ).toBe( 'My Blog' );
		// `SocialProfileCard` renders `@${handle}` at render time, so the
		// leading `@` on `webfinger` must be stripped here to avoid `@@`.
		expect( card.handle ).toBe( 'myblog@myblog.test' );
	} );

	it( 'leaves avatar null when icon is empty', () => {
		const card = mapFediverseConnectionToSocialProfileCardProps( makeConnection( { icon: '' } ) );
		expect( card.avatar ).toBeNull();
	} );

	it( 'leaves displayName undefined when name is blank/whitespace', () => {
		const card = mapFediverseConnectionToSocialProfileCardProps(
			makeConnection( { name: '   ' } )
		);
		expect( card.displayName ).toBeUndefined();
	} );
} );
