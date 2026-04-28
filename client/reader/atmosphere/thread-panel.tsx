import { useThreadQuery } from '@automattic/api-queries';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import EmptyContent from 'calypso/components/empty-content';
import { ThreadTree } from 'calypso/reader/social';
import { SocialAnalyticsProvider } from 'calypso/reader/social/components/post-card/analytics-context';
import { ThreadTombstone } from 'calypso/reader/social/components/thread-tree/thread-tombstone';
import { ThreadTreeSkeleton } from 'calypso/reader/social/components/thread-tree/thread-tree-skeleton';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { getThreadUrl as buildThreadUrl } from './route';
import { ThreadHeader } from './thread-header';
import type {
	AtmosphereConnection,
	AtmosphereError,
	AtmosphereThreadNode,
} from '@automattic/api-core';
import type { AppState } from 'calypso/types';

interface ThreadPanelProps {
	connection: AtmosphereConnection;
	did: string;
	rkey: string;
}

export function ThreadPanel( { connection, did, rkey }: ThreadPanelProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
	const lastErrorKind = useRef< string | null >( null );

	const targetUri = useMemo( () => `at://${ did }/app.bsky.feed.post/${ rkey }`, [ did, rkey ] );

	const { data, isPending, isError, error, refetch } = useThreadQuery( { uri: targetUri } );

	useEffect( () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_atmosphere_thread_viewed', {
				connection_id: connection.id,
				target_uri: targetUri,
			} )
		);
	}, [ connection.id, targetUri, dispatch ] );

	useEffect( () => {
		if ( isError && error && error.kind !== lastErrorKind.current ) {
			lastErrorKind.current = error.kind;
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_atmosphere_thread_error_shown', {
					connection_id: connection.id,
					target_uri: targetUri,
					error_kind: error.kind,
				} )
			);
		}
		if ( ! isError ) {
			lastErrorKind.current = null;
		}
	}, [ isError, error, connection.id, targetUri, dispatch ] );

	const handleRetry = useCallback( () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_atmosphere_thread_retry_clicked', {
				connection_id: connection.id,
				target_uri: targetUri,
				error_kind: error?.kind ?? 'unknown',
			} )
		);
		refetch();
	}, [ connection.id, targetUri, error, dispatch, refetch ] );

	const handleBackToTimeline = useCallback( () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_atmosphere_thread_back_to_timeline_clicked', {
				connection_id: connection.id,
				target_uri: targetUri,
			} )
		);
	}, [ connection.id, targetUri, dispatch ] );

	const onClickAnalytics = useCallback(
		( event: string, props: Record< string, unknown > ) => {
			// Re-prefix events emitted from inside the thread (post-card subcomponents
			// emit `_timeline_*` strings; ThreadPanel translates them to `_thread_*`).
			const reprefixed = event.replace( '_timeline_', '_thread_' );
			dispatch(
				recordReaderTracksEvent( reprefixed, {
					...props,
					target_uri: targetUri,
				} )
			);
		},
		[ dispatch, targetUri ]
	);

	const getThreadUrl = useCallback(
		( uri: string ) => buildThreadUrl( connection.id, uri ),
		[ connection.id ]
	);

	return (
		<>
			<ThreadHeader connection={ connection } onBackToTimeline={ handleBackToTimeline } />
			<SocialAnalyticsProvider
				value={ {
					source: 'atmosphere',
					connectionId: connection.id,
					onClick: onClickAnalytics,
					getThreadUrl,
				} }
			>
				{ renderBody( {
					translate,
					data,
					isPending,
					isError,
					error: error ?? null,
					handleRetry,
					targetUri,
				} ) }
			</SocialAnalyticsProvider>
		</>
	);
}

function renderBody( {
	translate,
	data,
	isPending,
	isError,
	error,
	handleRetry,
	targetUri,
}: {
	translate: ReturnType< typeof useTranslate >;
	data: { thread: AtmosphereThreadNode } | undefined;
	isPending: boolean;
	isError: boolean;
	error: AtmosphereError | null;
	handleRetry: () => void;
	targetUri: string;
} ) {
	if ( isPending ) {
		return <ThreadTreeSkeleton />;
	}
	if ( isError && error ) {
		return renderError( { translate, error, handleRetry } );
	}
	if ( ! data ) {
		return null;
	}
	if ( data.thread.type === 'not_found' ) {
		return <ThreadTombstone kind="not_found" />;
	}
	if ( data.thread.type === 'blocked' ) {
		return <ThreadTombstone kind="blocked" />;
	}
	return <ThreadTree root={ data.thread } targetUri={ targetUri } />;
}

function renderError( {
	translate,
	error,
	handleRetry,
}: {
	translate: ReturnType< typeof useTranslate >;
	error: AtmosphereError;
	handleRetry: () => void;
} ) {
	switch ( error.kind ) {
		case 'auth_required':
			return (
				<EmptyContent
					title={ translate( 'Reconnect needed' ) }
					line={ translate( 'Your Bluesky connection needs to be reconnected. Coming soon.' ) }
				/>
			);
		case 'not_found':
			return (
				<EmptyContent
					title={ translate( 'Thread not found' ) }
					line={ translate( 'This post is no longer available.' ) }
				/>
			);
		case 'rate_limited':
			return (
				<EmptyContent
					title={ translate( 'Slow down' ) }
					line={
						error.retry_after
							? translate( 'Bluesky is asking us to slow down. Try again in %(s)ds.', {
									args: { s: error.retry_after },
							  } )
							: translate( 'Bluesky is asking us to slow down. Try again in a moment.' )
					}
					action={
						<Button variant="secondary" onClick={ handleRetry }>
							{ translate( 'Retry' ) }
						</Button>
					}
				/>
			);
		case 'upstream_unavailable':
			return (
				<EmptyContent
					title={ translate( 'Bluesky unreachable' ) }
					line={ translate( 'Bluesky is temporarily unreachable. Try again in a moment.' ) }
					action={
						<Button variant="secondary" onClick={ handleRetry }>
							{ translate( 'Retry' ) }
						</Button>
					}
				/>
			);
		case 'bad_request':
			return (
				<EmptyContent
					title={ translate( "Couldn't load this post" ) }
					line={ translate( 'The post URL appears to be invalid.' ) }
				/>
			);
		default:
			return (
				<EmptyContent
					title={ translate( "Couldn't load thread" ) }
					line={ translate( 'Something went wrong.' ) }
					action={
						<Button variant="secondary" onClick={ handleRetry }>
							{ translate( 'Retry' ) }
						</Button>
					}
				/>
			);
	}
}
