import { useMastodonNotificationsInfiniteQuery } from '@automattic/api-queries';
import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { SocialNotificationsList } from 'calypso/reader/social';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import type { MastodonConnection } from '@automattic/api-core';
import type { ChipFilter } from 'calypso/reader/social';
import type { AppState } from 'calypso/types';

interface Props {
	connection: MastodonConnection;
}

export function NotificationsPanel( { connection }: Props ) {
	const [ filter, setFilter ] = useState< ChipFilter >( 'all' );
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
	const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useMastodonNotificationsInfiniteQuery( connection.id, { filter } );

	const items = useMemo( () => data?.pages.flatMap( ( p ) => p.items ) ?? [], [ data ] );

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
					recordReaderTracksEvent( 'calypso_reader_mastodon_notifications_filter_changed', {
						connection_id: connection.id,
						filter: next,
					} )
				);
			} }
			onStackExpandedChange={ ( expanded, member_count ) => {
				dispatch(
					recordReaderTracksEvent(
						expanded
							? 'calypso_reader_mastodon_notifications_stack_expanded'
							: 'calypso_reader_mastodon_notifications_stack_collapsed',
						{
							connection_id: connection.id,
							member_count,
							canonical_type: 'follow',
						}
					)
				);
			} }
		/>
	);
}
