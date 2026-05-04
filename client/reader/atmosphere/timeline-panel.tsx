import { useConnectionQuery, useTimelineInfiniteQuery } from '@automattic/api-queries';
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
import { useOptionalComposer } from './composer';
import { TimelineComposePill } from './composer/triggers/timeline-compose-pill';
import { projectAtmosphereError } from './error-projection';
import {
	getProfileUrl as buildProfileUrl,
	getTagFeedUrl as buildTagUrl,
	getThreadUrl as buildThreadUrl,
	type ProfileRefInput,
} from './route';
import type { AtmosphereConnection, AtmosphereFeedItem } from '@automattic/api-core';
import type { SocialPost } from 'calypso/reader/social';
import type { AppState } from 'calypso/types';

interface TimelinePanelProps {
	connection: AtmosphereConnection;
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

	const getProfileUrl = useCallback(
		( ref: ProfileRefInput ) => buildProfileUrl( connection.id, ref ),
		[ connection.id ]
	);

	const getTagUrl = useCallback(
		( tag: string ) => buildTagUrl( connection.id, tag ),
		[ connection.id ]
	);

	const composer = useOptionalComposer();
	const openComposer = composer?.openComposer;
	// Surfaces the real avatar on the compose pill — the list endpoint
	// that supplied `connection` always returns null for `avatar`. Pass
	// `null` when there is no composer upstream so `useConnectionQuery`
	// short-circuits and we don't warm the cache for shells that won't
	// render the pill.
	const { data: connectionDetails } = useConnectionQuery( composer ? connection.id : null );
	const onReplyClick = useMemo( () => {
		if ( ! openComposer ) {
			return undefined;
		}
		return ( post: SocialPost ) => {
			if ( ! post.cid ) {
				return;
			}
			const parent = { uri: post.uri, cid: post.cid };
			// `reply_root` is null when the post itself is the root of its
			// thread; in that case the post is also its own root. When set,
			// prefer the root's own `cid` (preserved through the atmosphere
			// mapper) so reply-to-reply submissions round-trip the actual
			// root strong-ref to AT-Proto's `createRecord`. Fall back to the
			// parent's `cid` for protocols that don't carry CIDs natively
			// (Mastodon) or older backend payloads where the field is absent.
			const root = post.reply_root
				? { uri: post.reply_root.uri, cid: post.reply_root.cid ?? post.cid }
				: parent;
			openComposer( {
				kind: 'reply',
				root,
				parent,
				previewPost: post,
			} );
		};
	}, [ openComposer ] );

	const renderItem = useCallback(
		( post: SocialPost ) => (
			<SocialPostCard post={ post } connectionId={ connection.id } variant="default" />
		),
		[ connection.id ]
	);
	const itemKey = useCallback( ( post: SocialPost ) => post.uri, [] );

	const analyticsValue = useMemo(
		() => ( {
			source: 'atmosphere' as const,
			connectionId: connection.id,
			onClick: onClickAnalytics,
			getThreadUrl,
			getProfileUrl,
			getTagUrl,
			onReplyClick,
		} ),
		[ connection.id, onClickAnalytics, getThreadUrl, getProfileUrl, getTagUrl, onReplyClick ]
	);

	return (
		<SocialAnalyticsProvider value={ analyticsValue }>
			{ composer && (
				<TimelineComposePill
					connection={ connection }
					avatar={ connectionDetails?.avatar }
					entryPoint="timeline_inline"
				/>
			) }
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
