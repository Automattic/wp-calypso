import { useAtmosphereTagFeedInfiniteQuery } from '@automattic/api-queries';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
	AuthorProfileHeader,
	SocialAnalyticsProvider,
	SocialFeedList,
	SocialPostCard,
	mapAtmosphereFeedItemToSocialPost,
	type SocialPost,
} from 'calypso/reader/social';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { projectAtmosphereError } from './error-projection';
import {
	getProfileUrl as buildProfileUrl,
	getTagFeedUrl,
	getThreadUrl as buildThreadUrl,
	getTimelineUrl,
	type ProfileRefInput,
} from './route';
import type { AtmosphereConnection, AtmosphereFeedItem } from '@automattic/api-core';
import type { AppState } from 'calypso/types';
import type { UnknownAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

interface Props {
	connection: AtmosphereConnection;
	hashtag: string;
}

export function TagFeedPanel( { connection, hashtag }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
	const lastErrorKind = useRef< string | null >( null );

	const feed = useAtmosphereTagFeedInfiniteQuery( connection.id, hashtag );

	// Fire tag_feed_viewed once per mounted (connection, hashtag) pair —
	// gated on resolved feed data so the payload reflects what the user
	// actually saw on first load. Pagination doesn't re-fire; switching
	// hashtags within the same mount does. Re-mounting (e.g., navigating
	// away and back) re-fires intentionally — that's a fresh view.
	const viewedFor = useRef< string | null >( null );
	useEffect( () => {
		const key = `${ connection.id }:${ hashtag }`;
		if ( viewedFor.current === key || ! feed.data ) {
			return;
		}
		viewedFor.current = key;
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_atmosphere_tag_feed_viewed', {
				connection_id: connection.id,
				hashtag,
			} )
		);
	}, [ connection.id, hashtag, feed.data, dispatch ] );

	useEffect( () => {
		if ( feed.isError && feed.error && feed.error.kind !== lastErrorKind.current ) {
			lastErrorKind.current = feed.error.kind;
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_atmosphere_tag_feed_error_shown', {
					connection_id: connection.id,
					hashtag,
					error_kind: feed.error.kind,
				} )
			);
		}
		if ( ! feed.isError ) {
			lastErrorKind.current = null;
		}
	}, [ feed.isError, feed.error, connection.id, hashtag, dispatch ] );

	const handleRetry = useCallback( () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_atmosphere_tag_feed_retry_clicked', {
				connection_id: connection.id,
				hashtag,
				error_kind: feed.error?.kind ?? 'unknown',
			} )
		);
		feed.refetch();
	}, [ connection.id, hashtag, feed, dispatch ] );

	const handleBackToTimeline = useCallback( () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_atmosphere_tag_feed_back_to_timeline_clicked', {
				connection_id: connection.id,
				hashtag,
			} )
		);
	}, [ connection.id, hashtag, dispatch ] );

	const onClickAnalytics = useCallback(
		( event: string, props: Record< string, unknown > ) => {
			// Subcomponents emit `calypso_reader_atmosphere_timeline_*`. Rewrite
			// the surface to `_tag_feed_` so dashboards can split.
			const TIMELINE_PREFIX = 'calypso_reader_atmosphere_timeline_';
			const TAG_PREFIX = 'calypso_reader_atmosphere_tag_feed_';
			const reprefixed = event.startsWith( TIMELINE_PREFIX )
				? TAG_PREFIX + event.slice( TIMELINE_PREFIX.length )
				: event;
			dispatch( recordReaderTracksEvent( reprefixed, { ...props, hashtag } ) );
		},
		[ dispatch, hashtag ]
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
		( tag: string ) => getTagFeedUrl( connection.id, tag ),
		[ connection.id ]
	);

	const items: SocialPost[] = useMemo( () => {
		const seen = new Set< string >();
		const deduped: AtmosphereFeedItem[] = [];
		for ( const post of feed.data?.pages.flatMap( ( pageData ) => pageData.items ?? [] ) ?? [] ) {
			if ( ! post?.uri || seen.has( post.uri ) ) {
				continue;
			}
			seen.add( post.uri );
			deduped.push( post );
		}
		return deduped.map( mapAtmosphereFeedItemToSocialPost );
	}, [ feed.data ] );

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
			getProfileUrl,
			getTagUrl,
		} ),
		[ connection.id, onClickAnalytics, getThreadUrl, getProfileUrl, getTagUrl ]
	);

	const tagInfo = feed.data?.pages[ 0 ]?.tag;
	// Backend emits `count: null` when the AppView's `hitsTotal` is absent
	// (see `tag-feed-page` normaliser); use a loose check so we hide the
	// count line for both a missing field and an explicit null.
	const countLine =
		typeof tagInfo?.count === 'number'
			? translate( '%(count)d post', '%(count)d posts', {
					count: tagInfo.count,
					args: { count: tagInfo.count },
			  } )
			: null;

	return (
		<SocialAnalyticsProvider value={ analyticsValue }>
			<VStack spacing={ 4 } className="atmosphere-tag-feed">
				<AuthorProfileHeader
					timelineUrl={ getTimelineUrl( connection.id ) }
					onBackToTimeline={ handleBackToTimeline }
				/>
				<div className="atmosphere-tag-feed__header">
					<h1 className="atmosphere-tag-feed__heading">{ `#${ hashtag }` }</h1>
					{ countLine ? <p className="atmosphere-tag-feed__count">{ countLine }</p> : null }
				</div>
				<SocialFeedList< SocialPost >
					items={ items }
					isPending={ feed.isPending }
					isError={ feed.isError }
					error={ projectAtmosphereError( feed.error ) }
					hasNextPage={ Boolean( feed.hasNextPage ) }
					isFetchingNextPage={ feed.isFetchingNextPage }
					fetchNextPage={ feed.fetchNextPage }
					refetch={ handleRetry }
					renderItem={ renderItem }
					itemKey={ itemKey }
					emptyTitle={ String(
						translate( 'No posts found for #%(hashtag)s.', { args: { hashtag } } )
					) }
					emptyLine={ String( translate( 'Check back later.' ) ) }
					protocolLabel="Bluesky"
					protocolHomeURL="/reader/atmosphere"
					protocolHomeLabel={ String( translate( 'Back to ATmosphere' ) ) }
				/>
			</VStack>
		</SocialAnalyticsProvider>
	);
}
