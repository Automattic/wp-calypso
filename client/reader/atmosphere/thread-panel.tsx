import { useThreadQuery } from '@automattic/api-queries';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import EmptyContent from 'calypso/components/empty-content';
import {
	SocialAnalyticsProvider,
	ThreadTombstone,
	ThreadTree,
	ThreadTreeSkeleton,
} from 'calypso/reader/social';
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

	const { data, isPending, isFetching, isError, error, refetch } = useThreadQuery( {
		uri: targetUri,
	} );

	useEffect( () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_atmosphere_thread_viewed', {
				connection_id: connection.id,
				thread_target_uri: targetUri,
			} )
		);
	}, [ connection.id, targetUri, dispatch ] );

	useEffect( () => {
		if ( isError && error && error.kind !== lastErrorKind.current ) {
			lastErrorKind.current = error.kind;
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_atmosphere_thread_error_shown', {
					connection_id: connection.id,
					thread_target_uri: targetUri,
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
				thread_target_uri: targetUri,
				error_kind: error?.kind ?? 'unknown',
			} )
		);
		refetch();
	}, [ connection.id, targetUri, error, dispatch, refetch ] );

	const handleBackToTimeline = useCallback( () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_atmosphere_thread_back_to_timeline_clicked', {
				connection_id: connection.id,
				thread_target_uri: targetUri,
			} )
		);
	}, [ connection.id, targetUri, dispatch ] );

	const onClickAnalytics = useCallback(
		( event: string, props: Record< string, unknown > ) => {
			// Shared post-card subcomponents emit
			// `calypso_reader_atmosphere_timeline_*` events. The thread
			// surface rewrites that prefix to `_thread_` so dashboards can
			// split by surface. Anchor on the full prefix so an event whose
			// payload happens to contain `_timeline_` elsewhere isn't
			// rewritten by accident.
			const TIMELINE_PREFIX = 'calypso_reader_atmosphere_timeline_';
			const THREAD_PREFIX = 'calypso_reader_atmosphere_thread_';
			const reprefixed = event.startsWith( TIMELINE_PREFIX )
				? THREAD_PREFIX + event.slice( TIMELINE_PREFIX.length )
				: event;
			dispatch(
				recordReaderTracksEvent( reprefixed, {
					...props,
					thread_target_uri: targetUri,
				} )
			);
		},
		[ dispatch, targetUri ]
	);

	const getThreadUrl = useCallback(
		( uri: string ) => buildThreadUrl( connection.id, uri ),
		[ connection.id ]
	);

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
		<>
			<ThreadHeader connection={ connection } onBackToTimeline={ handleBackToTimeline } />
			<SocialAnalyticsProvider value={ analyticsValue }>
				{ renderBody( {
					translate,
					data,
					isPending,
					isFetching,
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
	isFetching,
	isError,
	error,
	handleRetry,
	targetUri,
}: {
	translate: ReturnType< typeof useTranslate >;
	data: { thread: AtmosphereThreadNode } | undefined;
	isPending: boolean;
	isFetching: boolean;
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
		return isFetching ? <ThreadTreeSkeleton /> : null;
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
		case 'auth_failed':
		case 'invalid_handle':
		case 'invalid_credentials':
			return (
				<EmptyContent
					title={ translate( 'Reconnect needed' ) }
					line={ translate( 'Your Bluesky connection needs to be reconnected. Coming soon.' ) }
				/>
			);
		case 'connection_not_found':
			return (
				<EmptyContent
					title={ translate( 'Connection no longer exists' ) }
					line={ translate( 'Reconnect your Bluesky account to view this thread.' ) }
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
							? translate(
									'Bluesky is asking us to slow down. Try again in %(s)d second.',
									'Bluesky is asking us to slow down. Try again in %(s)d seconds.',
									{
										count: error.retry_after,
										args: { s: error.retry_after },
									}
							  )
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
					line={ error.message ?? translate( 'The post URL appears to be invalid.' ) }
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
