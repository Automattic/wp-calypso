import { useTimelineInfiniteQuery } from '@automattic/api-queries';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { SocialFeedList, SocialPostCard } from 'calypso/reader/social';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import type { AtmosphereConnection, AtmosphereFeedItem } from '@automattic/api-core';

interface TimelinePanelProps {
	connection: AtmosphereConnection;
}

export function TimelinePanel( { connection }: TimelinePanelProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const lastErrorKind = useRef< string | null >( null );

	const {
		data,
		isPending,
		isError,
		error,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
		refetch,
	} = useTimelineInfiniteQuery( connection.id );

	const items: AtmosphereFeedItem[] = useMemo(
		() => data?.pages.flatMap( ( page ) => page.feed ) ?? [],
		[ data ]
	);

	useEffect( () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_atmosphere_timeline_viewed', {
				connection_id: connection.id,
			} )
		);
	}, [ connection.id, dispatch ] );

	useEffect( () => {
		if ( isError && error && error.kind !== lastErrorKind.current ) {
			lastErrorKind.current = error.kind;
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_atmosphere_timeline_error_shown', {
					connection_id: connection.id,
					error_kind: error.kind,
				} )
			);
		}
		if ( ! isError ) {
			lastErrorKind.current = null;
		}
	}, [ isError, error, connection.id, dispatch ] );

	const handleRetry = () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_atmosphere_timeline_retry_clicked', {
				connection_id: connection.id,
				error_kind: error?.kind ?? 'unknown',
			} )
		);
		refetch();
	};

	return (
		<SocialFeedList< AtmosphereFeedItem >
			items={ items }
			isPending={ isPending }
			isError={ isError }
			error={ error ?? null }
			hasNextPage={ Boolean( hasNextPage ) }
			isFetchingNextPage={ isFetchingNextPage }
			fetchNextPage={ fetchNextPage }
			refetch={ handleRetry }
			renderItem={ ( post ) => <SocialPostCard post={ post } variant="default" /> }
			itemKey={ ( post ) => post.uri }
			emptyTitle={ translate( "You're all caught up." ) }
			emptyLine={ translate( 'Follow some accounts on Bluesky to see posts here.' ) }
			emptyActionLabel={ translate( 'Browse Bluesky' ) }
			emptyActionURL="https://bsky.app"
		/>
	);
}

export default TimelinePanel;
