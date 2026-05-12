import type {
	AtmosphereNotification,
	AtmosphereNotificationCanonicalType,
	MastodonNotification,
	MastodonNotificationCanonicalType,
} from '@automattic/api-core';

type SocialNotification = AtmosphereNotification | MastodonNotification;
export type SocialNotificationCanonicalType =
	| AtmosphereNotificationCanonicalType
	| MastodonNotificationCanonicalType;

export type SingleRow = { kind: 'single'; item: SocialNotification };
export type StackedRow = {
	kind: 'stack';
	groupKey: string;
	canonicalType: SocialNotificationCanonicalType;
	members: SocialNotification[];
	newestCreatedAt: string;
	isUnread: boolean;
	target: SocialNotification[ 'target' ];
	targetUrl: string;
};
export type GroupedRow = SingleRow | StackedRow;

function keyFor( n: SocialNotification ): string | null {
	if ( n.canonical_type === 'other' ) {
		return null;
	}
	if ( n.canonical_type === 'follow' ) {
		return 'follow';
	}
	const uri = n.target?.uri;
	if ( ! uri ) {
		return null;
	}
	return `${ n.canonical_type }:${ uri }`;
}

export function groupNotifications( items: SocialNotification[] ): GroupedRow[] {
	type Bucket = { key: string; members: SocialNotification[] };
	const buckets: Bucket[] = [];
	const byKey = new Map< string, Bucket >();

	for ( const item of items ) {
		const k = keyFor( item );
		if ( k === null ) {
			// Singleton: always its own bucket, placed in input order.
			const bucket: Bucket = { key: `__single:${ item.id }`, members: [ item ] };
			buckets.push( bucket );
			continue;
		}
		const existing = byKey.get( k );
		if ( existing ) {
			existing.members.push( item );
			continue;
		}
		const bucket: Bucket = { key: k, members: [ item ] };
		buckets.push( bucket );
		byKey.set( k, bucket );
	}

	return buckets.map( ( b ): GroupedRow => {
		if ( b.members.length === 1 ) {
			return { kind: 'single', item: b.members[ 0 ] };
		}
		const head = b.members[ 0 ];
		return {
			kind: 'stack',
			groupKey: b.key,
			canonicalType: head.canonical_type,
			members: b.members,
			newestCreatedAt: b.members.reduce(
				( max, m ) => ( m.created_at > max ? m.created_at : max ),
				b.members[ 0 ].created_at
			),
			isUnread: b.members.some( ( m ) => ! m.is_read ),
			target: head.target,
			targetUrl: head.target_url,
		};
	} );
}
