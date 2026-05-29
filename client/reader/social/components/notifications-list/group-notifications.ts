import { bucketFor } from './date-bucket';
import type {
	AtmosphereNotification,
	AtmosphereNotificationCanonicalType,
	FediverseNotification,
	FediverseNotificationCanonicalType,
	MastodonNotification,
	MastodonNotificationCanonicalType,
} from '@automattic/api-core';

type SocialNotification = AtmosphereNotification | MastodonNotification | FediverseNotification;
export type SocialNotificationCanonicalType =
	| AtmosphereNotificationCanonicalType
	| MastodonNotificationCanonicalType
	| FediverseNotificationCanonicalType;

/**
 * Canonical types that may form a stack. `keyFor` returns `null` for
 * `'other'`, so an `'other'` row always renders as a singleton — encoding
 * that here means the renderer's switch over `StackedRow.canonicalType`
 * stays exhaustive and unknown types fail typecheck instead of silently
 * collapsing to the `'other'` phrase.
 */
export type StackableCanonicalType = Exclude< SocialNotificationCanonicalType, 'other' >;

export type SingleRow = { kind: 'single'; item: SocialNotification };
export type StackedRow = {
	kind: 'stack';
	groupKey: string;
	canonicalType: StackableCanonicalType;
	members: SocialNotification[];
	newestCreatedAt: string;
	isUnread: boolean;
	target: SocialNotification[ 'target' ];
	targetUrl: string;
};
export type GroupedRow = SingleRow | StackedRow;

function keyFor( n: SocialNotification, now: Date ): string | null {
	if ( n.canonical_type === 'other' ) {
		return null;
	}
	if ( n.canonical_type === 'follow' ) {
		// Bucket follows by date so a long-tailed follower history doesn't
		// collapse into a single mega-stack. Each of today / yesterday /
		// this_week / earlier gets its own follow stack — same bucket
		// vocabulary `<SocialNotificationsList>` already uses for date
		// dividers, so stacks sit under matching headings.
		return `follow:${ bucketFor( n.created_at ?? '', now ) }`;
	}
	const uri = n.target?.uri;
	if ( ! uri ) {
		return null;
	}
	return `${ n.canonical_type }:${ uri }`;
}

export function groupNotifications(
	items: SocialNotification[],
	now: Date = new Date()
): GroupedRow[] {
	type Bucket = { key: string; members: SocialNotification[] };
	const buckets: Bucket[] = [];
	const byKey = new Map< string, Bucket >();

	for ( const item of items ) {
		const k = keyFor( item, now );
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
		// Safe by construction: `keyFor` returns null for `'other'`, so any
		// bucket that reached `members.length >= 2` cannot be `'other'`.
		const canonicalType = head.canonical_type as StackableCanonicalType;
		return {
			kind: 'stack',
			groupKey: b.key,
			canonicalType,
			members: b.members,
			newestCreatedAt: b.members.reduce< string >(
				( max, m ) => ( m.created_at && m.created_at > max ? m.created_at : max ),
				b.members[ 0 ].created_at ?? ''
			),
			isUnread: b.members.some( ( m ) => ! m.is_read ),
			target: head.target,
			targetUrl: head.target_url,
		};
	} );
}
