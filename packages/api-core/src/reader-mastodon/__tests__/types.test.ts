import type {
	MastodonAuthorFeedFilter,
	MastodonAuthorFeedPage,
	MastodonAuthorProfile,
	MastodonConnection,
	MastodonConnectionDetails,
	MastodonConnectionsResponse,
	MastodonCreateConnectionResponse,
	MastodonCreateFollowParams,
	MastodonDeleteFollowParams,
	MastodonFeedItem,
	MastodonFollowResponse,
	MastodonNotification,
	MastodonNotificationCanonicalType,
	MastodonNotificationsPage,
	MastodonProfileCounts,
	MastodonTagFilter,
	MastodonTagInfo,
	MastodonTagFeedPage,
	MastodonAuthorProfileViewer,
} from '../types';

describe( 'reader-mastodon types compile', () => {
	it( 'MastodonConnection canonical shape', () => {
		const listItem: MastodonConnection = {
			id: 1,
			handle: 'alice',
			instance: 'mastodon.social',
			display_name: 'Alice',
			avatar: null,
		};
		expect( listItem.display_name ).toBe( 'Alice' );
	} );

	it( 'response + details shapes', () => {
		const list: MastodonConnectionsResponse = { connections: [] };
		const created: MastodonCreateConnectionResponse = {
			connection: {
				id: 101,
				handle: 'alice',
				instance: 'mastodon.social',
				display_name: 'A',
				avatar: null,
			},
		};
		const counts: MastodonProfileCounts = { followers: 0, following: 0, posts: 0 };
		const details: MastodonConnectionDetails = {
			handle: 'alice',
			instance: 'mastodon.social',
			display_name: 'Alice',
			description: '',
			avatar: null,
			header: null,
			counts,
			raw: {},
		};
		expect( [ list, created ] ).toHaveLength( 2 );
		expect( details.counts.followers ).toBe( 0 );
		expect( details.instance ).toBe( 'mastodon.social' );
	} );
} );

describe( 'MastodonAuthorProfile', () => {
	it( 'has all the renderable Account fields plus locked + raw', () => {
		const profile: MastodonAuthorProfile = {
			id: '108020',
			acct: 'alice@mastodon.social',
			display_name: 'Alice',
			avatar: 'https://example.invalid/a.png',
			header: 'https://example.invalid/b.png',
			note: '<p>hello</p>',
			counts: { followers: 0, following: 0, posts: 0 },
			locked: false,
			raw: {},
		};
		expect( profile.acct ).toBe( 'alice@mastodon.social' );
	} );
} );

describe( 'MastodonAuthorFeedPage', () => {
	it( 'mirrors MastodonTimelinePage', () => {
		const page: MastodonAuthorFeedPage = { items: [] as MastodonFeedItem[], cursor: null };
		expect( page.cursor ).toBeNull();
	} );
} );

describe( 'MastodonAuthorFeedFilter', () => {
	it( 'accepts the three UI tab values', () => {
		const a: MastodonAuthorFeedFilter = 'posts_no_replies';
		const b: MastodonAuthorFeedFilter = 'posts_with_replies';
		const c: MastodonAuthorFeedFilter = 'posts_with_media';
		expect( [ a, b, c ] ).toEqual( [
			'posts_no_replies',
			'posts_with_replies',
			'posts_with_media',
		] );
	} );
} );

describe( 'MastodonTagFilter', () => {
	it( 'accepts the three UI tab values', () => {
		const a: MastodonTagFilter = 'all';
		const b: MastodonTagFilter = 'media';
		const c: MastodonTagFilter = 'local';
		expect( [ a, b, c ] ).toEqual( [ 'all', 'media', 'local' ] );
	} );
} );

describe( 'MastodonTagFeedPage', () => {
	it( 'has items + cursor + optional tag info', () => {
		const tag: MastodonTagInfo = { name: 'rust', count: 42 };
		const page: MastodonTagFeedPage = { items: [], cursor: null, tag };
		expect( page.tag?.name ).toBe( 'rust' );
		const minimal: MastodonTagFeedPage = { items: [], cursor: null };
		expect( minimal.tag ).toBeUndefined();
	} );
} );

describe( 'follow types', () => {
	it( 'MastodonAuthorProfileViewer carries following / followed_by / requested booleans', () => {
		const v: MastodonAuthorProfileViewer = {
			following: false,
			followed_by: true,
			requested: false,
		};
		expect( v.following ).toBe( false );
		expect( v.followed_by ).toBe( true );
		expect( v.requested ).toBe( false );
	} );

	it( 'MastodonAuthorProfile exposes viewer + is_self optionals', () => {
		const p: MastodonAuthorProfile = {
			id: '200',
			acct: 'alice@mastodon.social',
			display_name: 'Alice',
			avatar: null,
			header: null,
			note: '',
			counts: { followers: 0, following: 0, posts: 0 },
			locked: false,
			raw: {},
			viewer: { following: false, followed_by: false, requested: false },
			is_self: false,
		};
		expect( p.viewer?.following ).toBe( false );
		expect( p.is_self ).toBe( false );
	} );

	it( 'MastodonAuthorProfile exposes hide_collections as an optional boolean', () => {
		const hidden: MastodonAuthorProfile = {
			id: '200',
			acct: 'alice@mastodon.social',
			display_name: 'Alice',
			avatar: null,
			header: null,
			note: '',
			counts: { followers: 0, following: 0, posts: 0 },
			locked: false,
			hide_collections: true,
			raw: {},
		};
		expect( hidden.hide_collections ).toBe( true );

		// Older backend response — field absent. Consumers must treat
		// `undefined` as `false` (visible), not as "hidden".
		const visible: MastodonAuthorProfile = {
			id: '200',
			acct: 'alice@mastodon.social',
			display_name: 'Alice',
			avatar: null,
			header: null,
			note: '',
			counts: { followers: 0, following: 0, posts: 0 },
			locked: false,
			raw: {},
		};
		expect( visible.hide_collections ).toBeUndefined();
	} );

	it( 'MastodonCreateFollowParams + DeleteFollowParams shape', () => {
		const c: MastodonCreateFollowParams = { connectionId: 1, accountId: '200' };
		const d: MastodonDeleteFollowParams = { connectionId: 1, accountId: '200' };
		expect( c.accountId ).toBe( '200' );
		expect( d.accountId ).toBe( '200' );
	} );

	it( 'MastodonFollowResponse carries a viewer block', () => {
		const r: MastodonFollowResponse = {
			viewer: { following: true, followed_by: false, requested: false },
		};
		expect( r.viewer.following ).toBe( true );
	} );
} );

describe( 'MastodonNotification types', () => {
	it( 'canonical type accepts the documented enum values', () => {
		const types: MastodonNotificationCanonicalType[] = [
			'like',
			'repost',
			'follow',
			'mention',
			'reply',
			'quote',
			'other',
		];
		expect( types ).toHaveLength( 7 );
	} );

	it( 'MastodonNotification + page canonical shapes', () => {
		const canonical: MastodonNotificationCanonicalType = 'mention';
		const item: MastodonNotification = {
			id: '13371337',
			protocol_type: 'mention',
			canonical_type: canonical,
			actor: {
				handle: 'alice@mastodon.social',
				display_name: 'Alice',
				avatar_url: 'https://example.invalid/a.png',
				profile_uri: 'https://mastodon.social/@alice',
			},
			target: {
				kind: 'post',
				uri: 'https://mastodon.social/@me/110000000000000001',
				excerpt: '@me hi there',
			},
			target_url: 'https://mastodon.social/@me/110000000000000001',
			created_at: '2026-05-11T12:34:56Z',
			is_read: false,
		};
		const page: MastodonNotificationsPage = {
			items: [ item ],
			next_cursor: null,
			seen_at: '2026-05-11T00:00:00Z',
		};
		expect( page.items ).toHaveLength( 1 );
		expect( page.items[ 0 ].canonical_type ).toBe( 'mention' );
	} );

	it( 'MastodonNotification permits null target + null created_at', () => {
		// `null` target shape is the documented contract for forward-compat
		// types where the wpcom backend has no subject post to project
		// (e.g. follow, `other` items). `null` created_at covers
		// unparseable upstream timestamps.
		const item: MastodonNotification = {
			id: '13371338',
			protocol_type: 'admin.sign_up',
			canonical_type: 'other',
			actor: {
				handle: 'newbie@mastodon.social',
				display_name: null,
				avatar_url: null,
				profile_uri: 'https://mastodon.social/@newbie',
			},
			target: null,
			target_url: '',
			created_at: null,
			is_read: true,
		};
		expect( item.target ).toBeNull();
		expect( item.target_url ).toBe( '' );
	} );

	it( '@ts-expect-error rejects unknown canonical types', () => {
		// @ts-expect-error — string-literal union rejects bogus values.
		const bad: MastodonNotificationCanonicalType = 'bogus';
		expect( bad ).toBe( 'bogus' );
	} );
} );
