import './style.scss';

import { Button, Spinner, __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { bucketFor, type DateBucket } from './date-bucket';
import { NotificationsFilterBar } from './filter-bar';
import { groupNotifications, type GroupedRow } from './group-notifications';
import { SocialNotificationItem } from './notification-item';
import { StackedNotification } from './stacked-notification';
import type { ChipFilter } from './filter';
import type {
	AtmosphereNotification,
	FediverseNotification,
	MastodonNotification,
} from '@automattic/api-core';

type SocialNotification = AtmosphereNotification | MastodonNotification | FediverseNotification;

interface Props {
	items: SocialNotification[];
	isLoading: boolean;
	isLoadingMore?: boolean;
	isError: boolean;
	hasMore: boolean;
	onLoadMore: () => void;
	filter: ChipFilter;
	onFilterChange: ( next: ChipFilter ) => void;
	onStackExpandedChange?: ( expanded: boolean, memberCount: number ) => void;
}

function emptyMessage( filter: ChipFilter, translate: ReturnType< typeof useTranslate > ): string {
	switch ( filter ) {
		case 'conversations':
			return translate( 'No conversations yet.' ) as string;
		case 'likes':
			return translate( 'No likes yet.' ) as string;
		case 'reposts':
			return translate( 'No reposts yet.' ) as string;
		case 'follows':
			return translate( 'No follows yet.' ) as string;
		case 'all':
		default:
			return translate( 'No notifications yet.' ) as string;
	}
}

function bucketLabel( bucket: DateBucket, translate: ReturnType< typeof useTranslate > ): string {
	switch ( bucket ) {
		case 'today':
			return translate( 'Today' ) as string;
		case 'yesterday':
			return translate( 'Yesterday' ) as string;
		case 'this_week':
			return translate( 'This week' ) as string;
		case 'earlier':
			return translate( 'Earlier' ) as string;
	}
}

function rowTimestamp( row: GroupedRow ): string {
	return row.kind === 'stack' ? row.newestCreatedAt : row.item.created_at ?? '';
}

// `filter` is rendered into the chip strip but not applied to `items` locally —
// the per-protocol hook varies its query key on the active filter so the
// upstream endpoint returns the already-filtered page.
export function SocialNotificationsList( {
	items,
	isLoading,
	isLoadingMore = false,
	isError,
	hasMore,
	onLoadMore,
	filter,
	onFilterChange,
	onStackExpandedChange,
}: Props ) {
	const translate = useTranslate();

	// Share a single `now` across grouping and divider-bucketing so the
	// follow-stack key (which buckets by date) and its rendered divider
	// resolve to the same bucket. Re-derives only when items change — any
	// stale-by-a-render jitter is well below the bucket granularity.
	const grouped = useMemo( () => {
		const now = new Date();
		return { rows: groupNotifications( items, now ), now };
	}, [ items ] );

	const withBuckets = useMemo( () => {
		const out: Array< { kind: 'divider'; bucket: DateBucket } | { kind: 'row'; row: GroupedRow } > =
			[];
		const bucketsSeen: DateBucket[] = [];
		let lastBucket: DateBucket | null = null;
		for ( const row of grouped.rows ) {
			const b = bucketFor( rowTimestamp( row ), grouped.now );
			if ( b !== lastBucket ) {
				out.push( { kind: 'divider', bucket: b } );
				bucketsSeen.push( b );
				lastBucket = b;
			}
			out.push( { kind: 'row', row } );
		}
		if ( bucketsSeen.length === 1 ) {
			return out.filter( ( e ) => e.kind !== 'divider' );
		}
		return out;
	}, [ grouped ] );

	const filterBar = <NotificationsFilterBar value={ filter } onChange={ onFilterChange } />;

	if ( isLoading && items.length === 0 ) {
		return (
			<div className="social-notifications-list">
				{ filterBar }
				<div className="social-notifications-list__status" role="status" aria-live="polite">
					<Spinner />
					<span className="screen-reader-text">
						{ translate( 'Loading notifications' ) as string }
					</span>
				</div>
			</div>
		);
	}
	if ( isError && items.length === 0 ) {
		return (
			<div className="social-notifications-list">
				{ filterBar }
				<div className="social-notifications-list__status">
					<p>{ translate( 'We couldn’t load notifications. Try again later.' ) as string }</p>
				</div>
			</div>
		);
	}
	if ( items.length === 0 ) {
		return (
			<div className="social-notifications-list">
				{ filterBar }
				<div className="social-notifications-list__status">
					<p>{ emptyMessage( filter, translate ) }</p>
				</div>
			</div>
		);
	}

	// `isError && items.length > 0` means an earlier page succeeded but the
	// most recent fetchNextPage failed. Surface a retry affordance instead
	// of silently degrading to the last successful page.
	const showRetry = isError && hasMore && ! isLoadingMore;

	return (
		<div className="social-notifications-list">
			{ filterBar }
			<VStack spacing={ 0 }>
				{ withBuckets.map( ( entry, index ) => {
					if ( entry.kind === 'divider' ) {
						// Visual-only separator. Rendered as a presentational
						// `<div>` rather than a heading so the surrounding
						// route shell owns page heading order — every Reader
						// surface that mounts this list already supplies its
						// own page heading, and an `<h3>` here would land
						// without a parent `<h2>` on some of them.
						//
						// Key includes the entry index because a bucket can
						// appear more than once when wire items aren't strictly
						// monotonic by created_at (e.g. paginated pages re-merged,
						// or backend ordering quirks). The bucket name alone is
						// not unique in that case and would collide.
						return (
							<div
								key={ `divider-${ entry.bucket }-${ index }` }
								className="social-notifications-list__divider"
								role="presentation"
							>
								{ bucketLabel( entry.bucket, translate ) }
							</div>
						);
					}
					if ( entry.row.kind === 'stack' ) {
						return (
							<StackedNotification
								key={ entry.row.groupKey }
								stack={ entry.row }
								onExpandedChange={ onStackExpandedChange }
							/>
						);
					}
					return (
						<SocialNotificationItem key={ entry.row.item.id } notification={ entry.row.item } />
					);
				} ) }
				{ showRetry && (
					<div className="social-notifications-list__footer" role="alert">
						<p className="social-notifications-list__error">
							{ translate( 'We couldn’t load more notifications.' ) as string }
						</p>
						<Button variant="secondary" onClick={ onLoadMore }>
							{ translate( 'Try again' ) as string }
						</Button>
					</div>
				) }
				{ hasMore && ! isError && (
					<div className="social-notifications-list__footer">
						<Button
							variant="secondary"
							onClick={ onLoadMore }
							disabled={ isLoadingMore }
							isBusy={ isLoadingMore }
						>
							{ translate( 'Load more' ) as string }
						</Button>
					</div>
				) }
			</VStack>
		</div>
	);
}
