import { useFediverseTimelineInfiniteQuery } from '@automattic/api-queries';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
	SocialAnalyticsProvider,
	SocialFeedList,
	SocialPostCard,
	mapFediverseFeedItemToSocialPost,
	socialPostFeedItemKey,
} from 'calypso/reader/social';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { projectFediverseError } from './error-projection';
import { getProfileUrl, hostFromUrl } from './route';
import type { FediverseConnection, FediverseFeedItem } from '@automattic/api-core';
import type { SocialPost } from 'calypso/reader/social';
import type { AppState } from 'calypso/types';

interface TimelinePanelProps {
	connection: FediverseConnection;
}

export function TimelinePanel( { connection }: TimelinePanelProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
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
	} = useFediverseTimelineInfiniteQuery( connection.id );

	// Connection's home host — feeds the mapper's webfinger qualifier so
	// local-account `acct` values render as `@user@host`. Falls back to
	// the webfinger's host when URL parsing fails (defence-in-depth).
	const host = hostFromUrl( connection.url ) ?? connection.webfinger.split( '@' ).pop() ?? '';

	const items: SocialPost[] = useMemo(
		() =>
			(
				data?.pages
					.flatMap( ( page ) => page.items ?? [] )
					.filter( ( post ): post is FediverseFeedItem => Boolean( post?.url ) ) ?? []
			).map( ( item ) => mapFediverseFeedItemToSocialPost( item, { host } ) ),
		[ data, host ]
	);

	useEffect( () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_fediverse_timeline_viewed', {
				connection_id: connection.id,
			} )
		);
	}, [ connection.id, dispatch ] );

	useEffect( () => {
		if ( isError && error && error.kind !== lastErrorKind.current ) {
			lastErrorKind.current = error.kind;
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_fediverse_timeline_error_shown', {
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
			recordReaderTracksEvent( 'calypso_reader_fediverse_timeline_retry_clicked', {
				connection_id: connection.id,
				error_kind: error?.kind ?? 'unknown',
			} )
		);
		refetch();
	};

	const onClickAnalytics = useCallback(
		( event: string, props: Record< string, unknown > ) => {
			dispatch( recordReaderTracksEvent( event, props ) );
		},
		[ dispatch ]
	);

	const buildProfileUrl = useCallback(
		( ref: { id?: string | null; handle?: string | null } ) => {
			if ( ref.handle ) {
				return getProfileUrl( connection.id, ref.handle );
			}
			if ( ref.id ) {
				return getProfileUrl( connection.id, ref.id );
			}
			return null;
		},
		[ connection.id ]
	);

	const renderItem = useCallback(
		( post: SocialPost ) => (
			<SocialPostCard post={ post } connectionId={ connection.id } variant="default" />
		),
		[ connection.id ]
	);
	const itemKey = useCallback( ( post: SocialPost ) => socialPostFeedItemKey( post ), [] );

	const analyticsValue = useMemo(
		() => ( {
			source: 'fediverse' as const,
			connectionId: connection.id,
			onClick: onClickAnalytics,
			getProfileUrl: buildProfileUrl,
		} ),
		[ connection.id, onClickAnalytics, buildProfileUrl ]
	);

	return (
		<SocialAnalyticsProvider value={ analyticsValue }>
			<SocialFeedList< SocialPost >
				items={ items }
				isPending={ isPending }
				isError={ isError }
				error={ projectFediverseError( error ) }
				hasNextPage={ Boolean( hasNextPage ) }
				isFetchingNextPage={ isFetchingNextPage }
				fetchNextPage={ fetchNextPage }
				refetch={ handleRetry }
				renderItem={ renderItem }
				itemKey={ itemKey }
				emptyTitle={ translate( "You're all caught up." ) }
				emptyLine={ translate( 'Follow some accounts to see their posts here.' ) }
				emptyActionLabel={ translate( 'Open %(blog)s', {
					args: { blog: connection.name || connection.url },
				} ) }
				emptyActionURL={ connection.url }
				protocolLabel="Fediverse"
				protocolHomeURL="/reader/fediverse"
				protocolHomeLabel={ translate( 'Back to Fediverse' ) }
			/>
		</SocialAnalyticsProvider>
	);
}
