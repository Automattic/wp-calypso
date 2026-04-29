import { useMastodonThreadQuery } from '@automattic/api-queries';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import EmptyContent from 'calypso/components/empty-content';
import {
	SocialAnalyticsProvider,
	mapMastodonThreadResponseToSocialThreadNode,
} from 'calypso/reader/social';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { getProfileUrl, getThreadUrl as buildThreadUrl } from './route';
import { ThreadHeader } from './thread-header';
import { MastodonThreadTree } from './thread-tree';
import { MastodonThreadTreeSkeleton } from './thread-tree/thread-tree-skeleton';
import type {
	MastodonConnection,
	MastodonError,
	MastodonThreadResponse,
} from '@automattic/api-core';
import type { AppState } from 'calypso/types';

interface ThreadPanelProps {
	connection: MastodonConnection;
	statusId: string;
}

export function ThreadPanel( { connection, statusId }: ThreadPanelProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
	const lastErrorKind = useRef< string | null >( null );

	const { data, isPending, isFetching, isError, error, refetch } = useMastodonThreadQuery(
		connection.id,
		statusId
	);

	useEffect( () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_mastodon_thread_viewed', {
				connection_id: connection.id,
				thread_status_id: statusId,
			} )
		);
	}, [ connection.id, statusId, dispatch ] );

	useEffect( () => {
		if ( isError && error && error.kind !== lastErrorKind.current ) {
			lastErrorKind.current = error.kind;
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_mastodon_thread_error_shown', {
					connection_id: connection.id,
					thread_status_id: statusId,
					error_kind: error.kind,
				} )
			);
		}
		if ( ! isError ) {
			lastErrorKind.current = null;
		}
	}, [ isError, error, connection.id, statusId, dispatch ] );

	const handleRetry = useCallback( () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_mastodon_thread_retry_clicked', {
				connection_id: connection.id,
				thread_status_id: statusId,
				error_kind: error?.kind ?? 'unknown',
			} )
		);
		refetch();
	}, [ connection.id, statusId, error, dispatch, refetch ] );

	const handleBackToTimeline = useCallback( () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_mastodon_thread_back_to_timeline_clicked', {
				connection_id: connection.id,
				thread_status_id: statusId,
			} )
		);
	}, [ connection.id, statusId, dispatch ] );

	const onClickAnalytics = useCallback(
		( event: string, props: Record< string, unknown > ) => {
			// Shared post-card subcomponents emit
			// `calypso_reader_mastodon_timeline_*` events. The thread surface
			// rewrites that prefix to `_thread_` so dashboards can split by
			// surface. Anchor on the full prefix so an event whose payload
			// happens to contain `_timeline_` elsewhere isn't rewritten by
			// accident.
			const TIMELINE_PREFIX = 'calypso_reader_mastodon_timeline_';
			const THREAD_PREFIX = 'calypso_reader_mastodon_thread_';
			const reprefixed = event.startsWith( TIMELINE_PREFIX )
				? THREAD_PREFIX + event.slice( TIMELINE_PREFIX.length )
				: event;
			dispatch(
				recordReaderTracksEvent( reprefixed, {
					...props,
					thread_status_id: statusId,
				} )
			);
		},
		[ dispatch, statusId ]
	);

	const getThreadUrl = useCallback(
		( uri: string ) => buildThreadUrl( connection.id, uri ),
		[ connection.id ]
	);

	const buildProfileUrl = useCallback(
		( ref: { id?: string | null; handle?: string | null } ) => {
			if ( ref.id ) {
				return getProfileUrl( connection.id, ref.id );
			}
			if ( ref.handle ) {
				return getProfileUrl( connection.id, ref.handle, { instance: connection.instance } );
			}
			return null;
		},
		[ connection.id, connection.instance ]
	);

	const analyticsValue = useMemo(
		() => ( {
			source: 'mastodon' as const,
			connectionId: connection.id,
			onClick: onClickAnalytics,
			getThreadUrl,
			getProfileUrl: buildProfileUrl,
		} ),
		[ connection.id, onClickAnalytics, getThreadUrl, buildProfileUrl ]
	);

	return (
		<>
			<ThreadHeader connection={ connection } onBackToTimeline={ handleBackToTimeline } />
			<SocialAnalyticsProvider value={ analyticsValue }>
				{ renderBody( {
					translate,
					data,
					instance: connection.instance,
					isPending,
					isFetching,
					isError,
					error: error ?? null,
					handleRetry,
					targetUri: statusId,
				} ) }
			</SocialAnalyticsProvider>
		</>
	);
}

function renderBody( {
	translate,
	data,
	instance,
	isPending,
	isFetching,
	isError,
	error,
	handleRetry,
	targetUri,
}: {
	translate: ReturnType< typeof useTranslate >;
	data: MastodonThreadResponse | undefined;
	instance: string;
	isPending: boolean;
	isFetching: boolean;
	isError: boolean;
	error: MastodonError | null;
	handleRetry: () => void;
	targetUri: string;
} ) {
	if ( isPending ) {
		return <MastodonThreadTreeSkeleton />;
	}
	if ( isError && error ) {
		return renderError( { translate, error, handleRetry } );
	}
	if ( ! data || ! data.thread ) {
		if ( isFetching ) {
			return <MastodonThreadTreeSkeleton />;
		}
		// Defensive: a backend that hasn't been updated to the recursive
		// `{ thread }` shape (or any other malformed payload) shouldn't crash
		// the render tree. Surface the same not-found UI we'd show for a
		// genuinely missing post.
		return (
			<EmptyContent
				title={ translate( 'Thread not found' ) }
				line={ translate( 'This post is no longer available.' ) }
			/>
		);
	}
	const root = mapMastodonThreadResponseToSocialThreadNode( data, { instance } );
	return <MastodonThreadTree root={ root } targetUri={ targetUri } />;
}

function renderError( {
	translate,
	error,
	handleRetry,
}: {
	translate: ReturnType< typeof useTranslate >;
	error: MastodonError;
	handleRetry: () => void;
} ) {
	switch ( error.kind ) {
		case 'auth_required':
		case 'auth_failed':
			return (
				<EmptyContent
					title={ translate( 'Reconnect needed' ) }
					line={ translate(
						'Your Mastodon connection needs to be re-authorized. Disconnect and reconnect.'
					) }
				/>
			);
		case 'connection_not_found':
			return (
				<EmptyContent
					title={ translate( 'Connection no longer exists' ) }
					line={ translate( 'Reconnect your Mastodon account to view this thread.' ) }
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
									'Mastodon is asking us to slow down. Try again in %(s)d second.',
									'Mastodon is asking us to slow down. Try again in %(s)d seconds.',
									{
										count: error.retry_after,
										args: { s: error.retry_after },
									}
							  )
							: translate( 'Mastodon is asking us to slow down. Try again in a moment.' )
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
					title={ translate( 'Mastodon unreachable' ) }
					line={ translate( 'Mastodon is temporarily unreachable. Try again in a moment.' ) }
					action={
						<Button variant="secondary" onClick={ handleRetry }>
							{ translate( 'Retry' ) }
						</Button>
					}
				/>
			);
		case 'invalid_instance':
		case 'bad_request':
			return (
				<EmptyContent
					title={ translate( "Couldn't load this post" ) }
					line={
						error.kind === 'bad_request' && error.message
							? error.message
							: translate( 'The post URL appears to be invalid.' )
					}
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
