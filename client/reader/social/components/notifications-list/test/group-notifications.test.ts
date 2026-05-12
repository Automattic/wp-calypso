import { groupNotifications, type GroupedRow, type StackedRow } from '../group-notifications';
import type { AtmosphereNotification } from '@automattic/api-core';

type N = AtmosphereNotification;

function assertStack( row: GroupedRow ): asserts row is StackedRow {
	if ( row.kind !== 'stack' ) {
		throw new Error( `Expected a stack row, got: ${ row.kind }` );
	}
}

function makeItem( overrides: Partial< N > & { id: string } ): N {
	return {
		id: overrides.id,
		protocol_type: overrides.protocol_type ?? 'like',
		canonical_type: overrides.canonical_type ?? 'like',
		actor: overrides.actor ?? {
			handle: 'a.bsky.social',
			display_name: 'A',
			avatar_url: null,
			profile_uri: 'at://did:plc:a',
		},
		target: overrides.target ?? {
			kind: 'post',
			uri: 'at://did:plc:me/app.bsky.feed.post/p1',
			excerpt: 'hi',
		},
		target_url: overrides.target_url ?? 'https://bsky.app/profile/me/post/p1',
		created_at: overrides.created_at ?? '2026-05-12T12:00:00Z',
		is_read: overrides.is_read ?? false,
	};
}

describe( 'groupNotifications', () => {
	it( 'returns an empty array for empty input', () => {
		expect( groupNotifications( [] ) ).toEqual( [] );
	} );

	it( 'returns a single row for one item', () => {
		const items = [ makeItem( { id: '1' } ) ];
		const out = groupNotifications( items );
		expect( out ).toHaveLength( 1 );
		expect( out[ 0 ].kind ).toBe( 'single' );
	} );

	it( 'returns a single row for two items with different target URIs', () => {
		const a = makeItem( {
			id: '1',
			target: { kind: 'post', uri: 'at://post/a', excerpt: 'a' },
		} );
		const b = makeItem( {
			id: '2',
			target: { kind: 'post', uri: 'at://post/b', excerpt: 'b' },
		} );
		const out = groupNotifications( [ a, b ] );
		expect( out.map( ( r ) => r.kind ) ).toEqual( [ 'single', 'single' ] );
	} );

	it( 'stacks two like-items on the same target', () => {
		const a = makeItem( { id: '1', created_at: '2026-05-12T12:00:00Z' } );
		const b = makeItem( { id: '2', created_at: '2026-05-12T11:00:00Z' } );
		const out = groupNotifications( [ a, b ] );
		expect( out ).toHaveLength( 1 );
		assertStack( out[ 0 ] );
		expect( out[ 0 ].members ).toHaveLength( 2 );
		expect( out[ 0 ].newestCreatedAt ).toBe( '2026-05-12T12:00:00Z' );
		expect( out[ 0 ].canonicalType ).toBe( 'like' );
	} );

	it( 'does not stack a like and a repost on the same target', () => {
		const like = makeItem( { id: '1', canonical_type: 'like', protocol_type: 'like' } );
		const repost = makeItem( { id: '2', canonical_type: 'repost', protocol_type: 'repost' } );
		const out = groupNotifications( [ like, repost ] );
		expect( out.map( ( r ) => r.kind ) ).toEqual( [ 'single', 'single' ] );
	} );

	it( 'stacks all follows together (no target)', () => {
		const f1 = makeItem( {
			id: 'f1',
			canonical_type: 'follow',
			protocol_type: 'follow',
			target: null,
			target_url: 'https://bsky.app/profile/a',
		} );
		const f2 = makeItem( {
			id: 'f2',
			canonical_type: 'follow',
			protocol_type: 'follow',
			target: null,
			target_url: 'https://bsky.app/profile/b',
		} );
		const out = groupNotifications( [ f1, f2 ] );
		expect( out ).toHaveLength( 1 );
		assertStack( out[ 0 ] );
		expect( out[ 0 ].canonicalType ).toBe( 'follow' );
		expect( out[ 0 ].members ).toHaveLength( 2 );
	} );

	it( 'never stacks "other" items', () => {
		const o1 = makeItem( {
			id: 'o1',
			canonical_type: 'other',
			protocol_type: 'starterpack-joined',
		} );
		const o2 = makeItem( {
			id: 'o2',
			canonical_type: 'other',
			protocol_type: 'starterpack-joined',
		} );
		const out = groupNotifications( [ o1, o2 ] );
		expect( out.map( ( r ) => r.kind ) ).toEqual( [ 'single', 'single' ] );
	} );

	it( 'computes isUnread as true if any member is unread', () => {
		const a = makeItem( { id: '1', is_read: true } );
		const b = makeItem( { id: '2', is_read: false } );
		const out = groupNotifications( [ a, b ] );
		assertStack( out[ 0 ] );
		expect( out[ 0 ].isUnread ).toBe( true );
	} );

	it( 'computes newestCreatedAt as the max of member timestamps regardless of input order', () => {
		const a = makeItem( { id: '1', created_at: '2026-05-12T10:00:00Z' } );
		const b = makeItem( { id: '2', created_at: '2026-05-12T12:00:00Z' } );
		const c = makeItem( { id: '3', created_at: '2026-05-12T11:00:00Z' } );
		const out = groupNotifications( [ a, b, c ] );
		expect( out ).toHaveLength( 1 );
		assertStack( out[ 0 ] );
		expect( out[ 0 ].newestCreatedAt ).toBe( '2026-05-12T12:00:00Z' );
	} );

	it( 'positions a stack at its newest member', () => {
		// Order: A (newest, like-on-X), B (a single mention-on-Y between),
		// C (like-on-X, older). Stack of like-on-X should appear before B.
		const a = makeItem( { id: 'a', created_at: '2026-05-12T12:00:00Z' } );
		const b = makeItem( {
			id: 'b',
			canonical_type: 'mention',
			protocol_type: 'mention',
			target: { kind: 'post', uri: 'at://post/other', excerpt: 'other' },
			created_at: '2026-05-12T11:00:00Z',
		} );
		const c = makeItem( { id: 'c', created_at: '2026-05-12T10:00:00Z' } );
		const out = groupNotifications( [ a, b, c ] );
		expect( out ).toHaveLength( 2 );
		expect( out[ 0 ].kind ).toBe( 'stack' );
		expect( out[ 1 ].kind ).toBe( 'single' );
	} );
} );
