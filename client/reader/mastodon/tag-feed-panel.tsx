import { useMastodonTagFeedInfiniteQuery } from '@automattic/api-queries';
import { ExternalLink, __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
	AuthorProfileHeader,
	SocialAnalyticsProvider,
	SocialFeedList,
	SocialPostCard,
	mapMastodonFeedItemToSocialPost,
	type SocialPost,
} from 'calypso/reader/social';
import { LikeProvider } from 'calypso/reader/social/components/post-card/like-context';
import { RepostProvider } from 'calypso/reader/social/components/post-card/repost-context';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { projectMastodonError } from './error-projection';
import { getProfileUrl, getTagFeedUrl, getThreadUrl, getTimelineUrl } from './route';
import { MastodonTagFeedTabs, useMastodonTagFilter } from './tag-feed-tabs';
import { makeUseMastodonLikeAction } from './use-mastodon-like-action';
import { makeUseMastodonRepostAction } from './use-mastodon-repost-action';
import type { MastodonConnection, MastodonFeedItem } from '@automattic/api-core';
import type { AppState } from 'calypso/types';
import type { UnknownAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

interface Props {
	connection: MastodonConnection;
	hashtag: string;
}

export function MastodonTagFeedPanel( { connection, hashtag }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
	const lastErrorKind = useRef< string | null >( null );

	const filter = useMastodonTagFilter();
	const feed = useMastodonTagFeedInfiniteQuery( connection.id, hashtag, filter );

	// Reset error_shown dedup when filter changes so each filter's first
	// error fires its own analytics event even when the kind matches the
	// prior filter.
	useEffect( () => {
		lastErrorKind.current = null;
	}, [ filter ] );

	// Fire tag_feed_viewed exactly once per (connection, hashtag) — gated
	// on resolved feed data so the payload reflects what the user actually
	// saw on first load. Subsequent tab switches don't re-fire.
	const viewedFor = useRef< string | null >( null );
	useEffect( () => {
		const key = `${ connection.id }:${ hashtag }`;
		if ( viewedFor.current === key || ! feed.data ) {
			return;
		}
		viewedFor.current = key;
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_mastodon_tag_feed_viewed', {
				connection_id: connection.id,
				hashtag,
				initial_filter: filter,
			} )
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ connection.id, hashtag, feed.data, dispatch ] );

	useEffect( () => {
		if ( feed.isError && feed.error && feed.error.kind !== lastErrorKind.current ) {
			lastErrorKind.current = feed.error.kind;
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_mastodon_tag_feed_error_shown', {
					connection_id: connection.id,
					hashtag,
					error_kind: feed.error.kind,
					filter,
				} )
			);
		}
		if ( ! feed.isError ) {
			lastErrorKind.current = null;
		}
	}, [ feed.isError, feed.error, connection.id, hashtag, filter, dispatch ] );

	const handleRetry = useCallback( () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_mastodon_tag_feed_retry_clicked', {
				connection_id: connection.id,
				hashtag,
				filter,
				error_kind: feed.error?.kind ?? 'unknown',
			} )
		);
		feed.refetch();
	}, [ connection.id, hashtag, filter, feed, dispatch ] );

	const handleBackToTimeline = useCallback( () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_mastodon_tag_feed_back_to_timeline_clicked', {
				connection_id: connection.id,
				hashtag,
			} )
		);
	}, [ connection.id, hashtag, dispatch ] );

	const onClickAnalytics = useCallback(
		( event: string, props: Record< string, unknown > ) => {
			// Subcomponents emit `calypso_reader_mastodon_timeline_*`. Rewrite the
			// surface to `_tag_feed_` so dashboards can split.
			const TIMELINE_PREFIX = 'calypso_reader_mastodon_timeline_';
			const TAG_PREFIX = 'calypso_reader_mastodon_tag_feed_';
			const reprefixed = event.startsWith( TIMELINE_PREFIX )
				? TAG_PREFIX + event.slice( TIMELINE_PREFIX.length )
				: event;
			dispatch( recordReaderTracksEvent( reprefixed, { ...props, hashtag } ) );
		},
		[ dispatch, hashtag ]
	);

	const buildThreadUrl = useCallback(
		( uri: string ) => getThreadUrl( connection.id, uri ),
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

	const items: SocialPost[] = useMemo( () => {
		const seen = new Set< string >();
		const deduped: MastodonFeedItem[] = [];
		for ( const post of feed.data?.pages.flatMap( ( page ) => page.items ?? [] ) ?? [] ) {
			if ( ! post?.id || seen.has( post.id ) ) {
				continue;
			}
			seen.add( post.id );
			deduped.push( post );
		}
		return deduped.map( ( item ) =>
			mapMastodonFeedItemToSocialPost( item, { instance: connection.instance } )
		);
	}, [ feed.data, connection.instance ] );

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
			getThreadUrl: buildThreadUrl,
			getProfileUrl: buildProfileUrl,
			getTagUrl: buildTagUrl,
		} ),
		[ connection.id, onClickAnalytics, buildThreadUrl, buildProfileUrl, buildTagUrl ]
	);

	const useRepostAction = useMemo(
		() => makeUseMastodonRepostAction( connection.id ),
		[ connection.id ]
	);

	const tagInfo = feed.data?.pages[ 0 ]?.tag;
	const countLine =
		tagInfo?.count !== undefined
			? translate( '%(count)d post', '%(count)d posts', {
					count: tagInfo.count,
					args: { count: tagInfo.count },
			  } )
			: null;

	// Defence-in-depth on a third-party-supplied URL: only honour https URLs
	// even though the backend should only ever emit a Mastodon home-instance
	// URL. Anything else (javascript:, http://, malformed) falls through to
	// no link rather than reaching the DOM as an anchor href.
	const externalTagUrl = ( () => {
		if ( ! tagInfo?.url ) {
			return null;
		}
		try {
			return new URL( tagInfo.url ).protocol === 'https:' ? tagInfo.url : null;
		} catch {
			return null;
		}
	} )();

	return (
		<SocialAnalyticsProvider value={ analyticsValue }>
			<LikeProvider value={ useLikeAction }>
				<RepostProvider value={ useRepostAction }>
					<VStack spacing={ 4 } className="mastodon-tag-feed">
						<AuthorProfileHeader
							timelineUrl={ getTimelineUrl( connection.id ) }
							onBackToTimeline={ handleBackToTimeline }
						/>
						<div className="mastodon-tag-feed__header">
							<h1 className="mastodon-tag-feed__heading">{ `#${ hashtag }` }</h1>
							{ countLine ? <p className="mastodon-tag-feed__count">{ countLine }</p> : null }
							{ externalTagUrl ? (
								<ExternalLink className="mastodon-tag-feed__external-link" href={ externalTagUrl }>
									{ translate( 'View on Mastodon' ) }
								</ExternalLink>
							) : null }
						</div>
						<MastodonTagFeedTabs
							connectionId={ connection.id }
							hashtag={ hashtag }
							activeFilter={ filter }
						/>
						<SocialFeedList< SocialPost >
							items={ items }
							isPending={ feed.isPending }
							isError={ feed.isError }
							error={ projectMastodonError( feed.error ) }
							hasNextPage={ Boolean( feed.hasNextPage ) }
							isFetchingNextPage={ feed.isFetchingNextPage }
							fetchNextPage={ feed.fetchNextPage }
							refetch={ handleRetry }
							renderItem={ renderItem }
							itemKey={ itemKey }
							emptyTitle={ String(
								translate( 'No posts found for #%(hashtag)s.', { args: { hashtag } } )
							) }
							emptyLine={ String( translate( 'Try a different filter or check back later.' ) ) }
							protocolLabel="Mastodon"
							protocolHomeURL="/reader/mastodon"
							protocolHomeLabel={ String( translate( 'Back to Mastodon' ) ) }
						/>
					</VStack>
				</RepostProvider>
			</LikeProvider>
		</SocialAnalyticsProvider>
	);
}
