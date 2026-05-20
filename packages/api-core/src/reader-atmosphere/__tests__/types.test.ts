import type {
	AtmosphereConnection,
	AtmosphereConnectionDetails,
	AtmosphereConnectionsResponse,
	AtmosphereCreateConnectionResponse,
	AtmosphereProfileCounts,
	AtmosphereNotification,
	AtmosphereNotificationActor,
	AtmosphereNotificationTarget,
	AtmosphereNotificationCanonicalType,
	AtmosphereNotificationsPage,
} from '../types';

describe( 'reader-atmosphere types compile', () => {
	it( 'AtmosphereConnection canonical shape', () => {
		const listItem: AtmosphereConnection = {
			id: 1,
			handle: 'a.bsky.social',
			display_name: 'Alice',
			did: 'did:plc:x',
			avatar: null,
		};
		expect( listItem.display_name ).toBe( 'Alice' );
	} );

	it( 'AtmosphereConnection accepts optional pds_hostname', () => {
		const withHost: AtmosphereConnection = {
			id: 2,
			handle: 'b.example.com',
			display_name: null,
			did: 'did:plc:y',
			avatar: null,
			pds_hostname: 'pds.example.com',
		};
		const withNullHost: AtmosphereConnection = {
			id: 3,
			handle: 'c.bsky.social',
			display_name: null,
			did: 'did:plc:z',
			avatar: null,
			pds_hostname: null,
		};
		expect( withHost.pds_hostname ).toBe( 'pds.example.com' );
		expect( withNullHost.pds_hostname ).toBeNull();
	} );

	it( 'response + details shapes', () => {
		const list: AtmosphereConnectionsResponse = { connections: [] };
		const created: AtmosphereCreateConnectionResponse = {
			connection: {
				id: 101,
				handle: 'a',
				display_name: 'A',
				did: 'did:plc:a',
				avatar: null,
			},
		};
		const counts: AtmosphereProfileCounts = { followers: 0, follows: 0, posts: 0 };
		const details: AtmosphereConnectionDetails = {
			did: 'did:plc:x',
			handle: 'a.bsky.social',
			display_name: 'Alice',
			description: '',
			avatar: null,
			banner: null,
			counts,
		};
		expect( [ list, created ] ).toHaveLength( 2 );
		expect( details.counts.followers ).toBe( 0 );
	} );
} );

describe( 'AtmosphereNotification types', () => {
	it( 'compiles a notification envelope', () => {
		const actor: AtmosphereNotificationActor = {
			handle: 'jane.bsky.social',
			display_name: 'Jane',
			avatar_url: 'https://example/avatar.png',
			profile_uri: 'at://did:plc:jane',
		};
		const target: AtmosphereNotificationTarget = {
			kind: 'post',
			uri: 'at://did:plc:me/app.bsky.feed.post/3k',
			excerpt: 'hello',
		};
		const canonical: AtmosphereNotificationCanonicalType = 'like';
		const item: AtmosphereNotification = {
			id: 'at://did:plc:jane/app.bsky.feed.like/3l',
			protocol_type: 'like',
			canonical_type: canonical,
			actor,
			target,
			target_url: 'https://bsky.app/profile/me/post/3k',
			created_at: '2026-05-11T12:34:56Z',
			is_read: false,
		};
		const page: AtmosphereNotificationsPage = {
			items: [ item ],
			next_cursor: null,
			seen_at: '2026-05-10T00:00:00Z',
		};
		expect( page.items[ 0 ].canonical_type ).toBe( 'like' );
	} );

	it( 'rejects unknown canonical_type values', () => {
		// @ts-expect-error - 'bogus' is not in the canonical union.
		const bad: AtmosphereNotificationCanonicalType = 'bogus';
		expect( bad ).toBe( 'bogus' );
	} );
} );
