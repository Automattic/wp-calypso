import { useMastodonTimelineInfiniteQuery } from '@automattic/api-queries';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
	SocialAnalyticsProvider,
	SocialFeedList,
	SocialPostCard,
	mapMastodonFeedItemToSocialPost,
} from 'calypso/reader/social';
import { LikeProvider } from 'calypso/reader/social/components/post-card/like-context';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { projectMastodonError } from './error-projection';
import { getProfileUrl, getTagFeedUrl, getThreadUrl as buildThreadUrl } from './route';
import { makeUseMastodonLikeAction } from './use-mastodon-like-action';
import type { MastodonConnection, MastodonFeedItem } from '@automattic/api-core';
import type { SocialPost } from 'calypso/reader/social';
import type { AppState } from 'calypso/types';

interface TimelinePanelProps {
	connection: MastodonConnection;
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
	} = useMastodonTimelineInfiniteQuery( connection.id );

	const items: SocialPost[] = useMemo(
		() =>
			(
				data?.pages
					.flatMap( ( page ) => page.items ?? [] )
					.filter( ( post ): post is MastodonFeedItem => Boolean( post?.url ) ) ?? []
			).map( ( item ) =>
				mapMastodonFeedItemToSocialPost( item, { instance: connection.instance } )
			),
		[ data, connection.instance ]
	);

	useEffect( () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_mastodon_timeline_viewed', {
				connection_id: connection.id,
			} )
		);
	}, [ connection.id, dispatch ] );

	useEffect( () => {
		if ( isError && error && error.kind !== lastErrorKind.current ) {
			lastErrorKind.current = error.kind;
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_mastodon_timeline_error_shown', {
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
			recordReaderTracksEvent( 'calypso_reader_mastodon_timeline_retry_clicked', {
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

	const buildTagUrl = useCallback(
		( tag: string ) => getTagFeedUrl( connection.id, tag ),
		[ connection.id ]
	);

	const useLikeAction = useMemo(
		() => makeUseMastodonLikeAction( connection.id ),
		[ connection.id ]
	);

	const renderItem = useCallback(
		( post: SocialPost ) => (
			<SocialPostCard post={ post } connectionId={ connection.id } variant="default" />
		),
		[ connection.id ]
	);
	const itemKey = useCallback( ( post: SocialPost ) => post.uri, [] );

	const analyticsValue = useMemo(
		() => ( {
			source: 'mastodon' as const,
			connectionId: connection.id,
			onClick: onClickAnalytics,
			getThreadUrl,
			getProfileUrl: buildProfileUrl,
			getTagUrl: buildTagUrl,
		} ),
		[ connection.id, onClickAnalytics, getThreadUrl, buildProfileUrl, buildTagUrl ]
	);

	return (
		<SocialAnalyticsProvider value={ analyticsValue }>
			<LikeProvider value={ useLikeAction }>
				<SocialFeedList< SocialPost >
					items={ items }
					isPending={ isPending }
					isError={ isError }
					error={ projectMastodonError( error ) }
					hasNextPage={ Boolean( hasNextPage ) }
					isFetchingNextPage={ isFetchingNextPage }
					fetchNextPage={ fetchNextPage }
					refetch={ handleRetry }
					renderItem={ renderItem }
					itemKey={ itemKey }
					emptyTitle={ translate( "You're all caught up." ) }
					emptyLine={ translate( 'Follow some accounts on Mastodon to see posts here.' ) }
					emptyActionLabel={ translate( 'Open your Mastodon instance' ) }
					emptyActionURL={ `https://${ connection.instance }` }
					protocolLabel="Mastodon"
					protocolHomeURL="/reader/mastodon"
					protocolHomeLabel={ translate( 'Back to Mastodon' ) }
				/>
			</LikeProvider>
		</SocialAnalyticsProvider>
	);
}
