import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { SocialNotificationsList } from './components/notifications-list';
import type { ChipFilter } from './components/notifications-list/filter';
import type {
	NotificationInAppUrlResolver,
	SocialNotification,
} from './components/notifications-list/notification-item';
import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import type { AppState } from 'calypso/types';
import type { UnknownAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

export type SocialNotificationsSource = 'atmosphere' | 'mastodon' | 'fediverse';

interface NotificationsPageShape< TItem > {
	items: TItem[];
	next_cursor: string | null;
	seen_at: string | null;
}

export type UseSocialNotificationsInfiniteQuery< TItem extends SocialNotification > = (
	connectionId: number,
	options: { filter: ChipFilter }
) => UseInfiniteQueryResult< InfiniteData< NotificationsPageShape< TItem > >, unknown >;

interface Props< TItem extends SocialNotification > {
	connectionId: number;
	source: SocialNotificationsSource;
	useNotificationsInfiniteQuery: UseSocialNotificationsInfiniteQuery< TItem >;
	/**
	 * Resolver mapping a notification to an in-app URL (typically the Reader's
	 * own thread view for that protocol). When the resolver returns `null`,
	 * the row falls back to the external `target_url`. Per-protocol panels
	 * supply this so mentions / replies / quotes open inside the Reader
	 * instead of bouncing the user to bsky.app or their home Mastodon
	 * instance.
	 */
	getInAppUrl?: NotificationInAppUrlResolver;
}

/**
 * Shared notifications-tab body for all Reader social protocols. Owns the
 * filter chip state, the infinite-query flatMap, and the per-protocol Tracks
 * dispatches; takes the protocol-specific infinite-query hook as a prop so
 * the per-protocol wrappers can shrink to ~4 lines and stay byte-symmetric
 * by construction. `source` interpolates into the Tracks event names; the
 * wpcom backend ships a byte-compatible envelope across protocols so the
 * shared `<SocialNotificationsList>` renders any of them without branching.
 */
export function SocialNotificationsPanel< TItem extends SocialNotification >( {
	connectionId,
	source,
	useNotificationsInfiniteQuery,
	getInAppUrl,
}: Props< TItem > ) {
	const [ filter, setFilter ] = useState< ChipFilter >( 'all' );
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
	const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useNotificationsInfiniteQuery( connectionId, { filter } );

	const items = useMemo< SocialNotification[] >(
		() => data?.pages.flatMap( ( p ) => p.items ) ?? [],
		[ data ]
	);

	return (
		<SocialNotificationsList
			items={ items }
			isLoading={ isPending }
			isLoadingMore={ isFetchingNextPage }
			isError={ isError }
			hasMore={ !! hasNextPage }
			onLoadMore={ () => {
				fetchNextPage();
			} }
			filter={ filter }
			onFilterChange={ ( next ) => {
				setFilter( next );
				dispatch(
					recordReaderTracksEvent( `calypso_reader_${ source }_notifications_filter_changed`, {
						connection_id: connectionId,
						filter: next,
					} )
				);
			} }
			getInAppUrl={ getInAppUrl }
			onStackExpandedChange={ ( expanded, member_count ) => {
				dispatch(
					recordReaderTracksEvent(
						expanded
							? `calypso_reader_${ source }_notifications_stack_expanded`
							: `calypso_reader_${ source }_notifications_stack_collapsed`,
						{
							connection_id: connectionId,
							member_count,
							canonical_type: 'follow',
						}
					)
				);
			} }
		/>
	);
}
