import type {
	MastodonAuthorFeedFilter,
	MastodonAuthorFeedPage,
	MastodonAuthorProfile,
	MastodonConnection,
	MastodonConnectionDetails,
	MastodonConnectionsResponse,
	MastodonCreateConnectionResponse,
	MastodonFeedItem,
	MastodonProfileCounts,
	MastodonTagFilter,
	MastodonTagInfo,
	MastodonTagFeedPage,
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
