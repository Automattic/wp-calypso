import { useTimelineInfiniteQuery } from '@automattic/api-queries';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
	SocialAnalyticsProvider,
	SocialFeedList,
	SocialPostCard,
	mapAtmosphereFeedItemToSocialPost,
} from 'calypso/reader/social';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { getThreadUrl as buildThreadUrl } from './route';
import type {
	AtmosphereConnection,
	AtmosphereError,
	AtmosphereFeedItem,
} from '@automattic/api-core';
import type { SocialError, SocialPost } from 'calypso/reader/social';
import type { AppState } from 'calypso/types';

interface TimelinePanelProps {
	connection: AtmosphereConnection;
}

function projectAtmosphereError( err: AtmosphereError | null | undefined ): SocialError | null {
	if ( ! err ) {
		return null;
	}
	switch ( err.kind ) {
		case 'auth_required':
		case 'not_found':
		case 'upstream_unavailable':
			return { kind: err.kind };
		case 'auth_failed':
		case 'invalid_credentials':
			// Stale credentials — same recovery as auth_required.
			return { kind: 'auth_required' };
		case 'connection_not_found':
			// User-side connection deleted — semantically a not_found.
			return { kind: 'not_found' };
		case 'rate_limited':
			return err.retry_after !== undefined
				? { kind: 'rate_limited', retry_after: err.retry_after }
				: { kind: 'rate_limited' };
		case 'invalid_handle':
		case 'bad_request':
		case 'unknown':
			return { kind: 'unknown', cause: err };
		default:
			return assertNever( err );
	}
}

function assertNever( value: never ): never {
	throw new Error( `Unhandled AtmosphereError kind: ${ JSON.stringify( value ) }` );
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
	} = useTimelineInfiniteQuery( connection.id );

	const items: SocialPost[] = useMemo(
		() =>
			(
				data?.pages
					.flatMap( ( page ) => page.items ?? [] )
					.filter( ( post ): post is AtmosphereFeedItem => Boolean( post?.uri ) ) ?? []
			).map( mapAtmosphereFeedItemToSocialPost ),
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

	const handleRetry = useCallback( () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_atmosphere_timeline_retry_clicked', {
				connection_id: connection.id,
				error_kind: error?.kind ?? 'unknown',
			} )
		);
		refetch();
	}, [ connection.id, error, dispatch, refetch ] );

	const onClickAnalytics = useCallback(
		( event: string, props: Record< string, unknown > ) => {
			dispatch( recordReaderTracksEvent( event, props ) );
		},
		[ dispatch ]
	);

	const getThreadUrl = useCallback(
		( uri: string ) => buildThreadUrl( connection.id, uri ),
		[ connection.id ]
	);

	const renderItem = useCallback(
		( post: SocialPost ) => <SocialPostCard post={ post } variant="default" />,
		[]
	);
	const itemKey = useCallback( ( post: SocialPost ) => post.uri, [] );

	const analyticsValue = useMemo(
		() => ( {
			source: 'atmosphere' as const,
			connectionId: connection.id,
			onClick: onClickAnalytics,
			getThreadUrl,
		} ),
		[ connection.id, onClickAnalytics, getThreadUrl ]
	);

	return (
		<SocialAnalyticsProvider value={ analyticsValue }>
			<SocialFeedList< SocialPost >
				items={ items }
				isPending={ isPending }
				isError={ isError }
				error={ projectAtmosphereError( error ) }
				hasNextPage={ Boolean( hasNextPage ) }
				isFetchingNextPage={ isFetchingNextPage }
				fetchNextPage={ fetchNextPage }
				refetch={ handleRetry }
				renderItem={ renderItem }
				itemKey={ itemKey }
				emptyTitle={ translate( "You're all caught up." ) }
				emptyLine={ translate( 'Follow some accounts on Bluesky to see posts here.' ) }
				emptyActionLabel={ translate( 'Browse Bluesky' ) }
				emptyActionURL="https://bsky.app"
				protocolLabel="Bluesky"
				protocolHomeURL="/reader/atmosphere"
				protocolHomeLabel={ translate( 'Back to ATmosphere' ) }
			/>
		</SocialAnalyticsProvider>
	);
}

export default TimelinePanel;
