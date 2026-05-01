import { useAuthorFeedInfiniteQuery, useAuthorProfileQuery } from '@automattic/api-queries';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import {
	AuthorProfileHeader,
	SocialAnalyticsProvider,
	SocialFeedList,
	SocialPostCard,
	SocialProfileCard,
	SocialProfileHeaderSkeleton,
	mapAtmosphereFeedItemToSocialPost,
	type SocialPost,
	type SocialProfileStat,
} from 'calypso/reader/social';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { AuthorProfileTabs, useAuthorProfileFilter } from './author-profile-tabs';
import { projectAtmosphereError } from './error-projection';
import { errorMessage } from './profile-errors';
import { getProfileUrl, getTagFeedUrl, getThreadUrl, getTimelineUrl } from './route';
import type {
	AtmosphereAuthorFeedFilter,
	AtmosphereAuthorProfile,
	AtmosphereConnection,
	AtmosphereError,
	AtmosphereFeedItem,
} from '@automattic/api-core';
import type { AppState } from 'calypso/types';
import type { UnknownAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

function buildEmptyTitle(
	filter: AtmosphereAuthorFeedFilter,
	handle: string,
	translate: ReturnType< typeof useTranslate >
): string {
	switch ( filter ) {
		case 'posts_with_replies':
			return String(
				translate( '@%(handle)s hasn’t replied to anyone yet.', {
					args: { handle },
				} )
			);
		case 'posts_with_media':
			return String(
				translate( '@%(handle)s hasn’t posted any media yet.', {
					args: { handle },
				} )
			);
		case 'posts_no_replies':
		case 'posts_and_author_threads':
		default:
			return String(
				translate( '@%(handle)s hasn’t posted yet.', {
					args: { handle },
				} )
			);
	}
}

interface AuthorProfilePanelProps {
	connection: AtmosphereConnection;
	actor: string;
}

export function AuthorProfilePanel( { connection, actor }: AuthorProfilePanelProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
	const filter = useAuthorProfileFilter();
	const lastErrorKind = useRef< { header: string | null; feed: string | null } >( {
		header: null,
		feed: null,
	} );

	const profile = useAuthorProfileQuery( { actor } );
	const feed = useAuthorFeedInfiniteQuery( { actor, filter } );

	// Reset the error_shown dedup ref when navigating between profiles so the
	// next author's first error fires its analytics even when the kind matches.
	useEffect( () => {
		lastErrorKind.current = { header: null, feed: null };
	}, [ actor, connection.id ] );

	// Per-filter feed errors must each fire their own _error_shown event,
	// even when the kinds match (e.g. rate_limited on Posts then Replies).
	useEffect( () => {
		lastErrorKind.current.feed = null;
	}, [ filter ] );

	// Fire profile_viewed exactly once per (actor, connection) — but wait until
	// the profile data resolves so the Tracks payload carries the resolved DID
	// and handle. Without the gate, the event ships with both fields undefined
	// and dashboards can't tell DID-URL views from handle-URL views. Resets to
	// false when actor/connection change so navigation between profiles re-fires.
	const viewedFor = useRef< string | null >( null );
	useEffect( () => {
		const key = `${ connection.id }:${ actor }`;
		if ( viewedFor.current === key || ! profile.data ) {
			return;
		}
		viewedFor.current = key;
		// Capture filter at first-fire time. The event semantics are "what filter
		// was active when the user first opened this profile", which is decided
		// the moment profile.data resolves — not on subsequent tab switches.
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_atmosphere_profile_viewed', {
				connection_id: connection.id,
				actor,
				actor_did: profile.data.did,
				actor_handle: profile.data.handle,
				initial_filter: filter,
			} )
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ actor, connection.id, profile.data, dispatch ] );

	useEffect( () => {
		if ( profile.isError && profile.error && profile.error.kind !== lastErrorKind.current.header ) {
			lastErrorKind.current.header = profile.error.kind;
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_atmosphere_profile_error_shown', {
					connection_id: connection.id,
					actor,
					error_kind: profile.error.kind,
					surface: 'header',
				} )
			);
		}
		if ( ! profile.isError ) {
			lastErrorKind.current.header = null;
		}
	}, [ profile.isError, profile.error, connection.id, actor, dispatch ] );

	useEffect( () => {
		if ( feed.isError && feed.error && feed.error.kind !== lastErrorKind.current.feed ) {
			lastErrorKind.current.feed = feed.error.kind;
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_atmosphere_profile_error_shown', {
					connection_id: connection.id,
					actor,
					error_kind: feed.error.kind,
					surface: 'feed',
					filter,
				} )
			);
		}
		if ( ! feed.isError ) {
			lastErrorKind.current.feed = null;
		}
	}, [ feed.isError, feed.error, connection.id, actor, filter, dispatch ] );

	const items: SocialPost[] = useMemo( () => {
		// Bluesky's getAuthorFeed can return the same post URI more than once
		// across pages (e.g., the author reposted their own post, or a
		// pagination boundary races); dedupe so React's keyed list stays
		// stable. Dedup runs against the AtmosphereFeedItem shape (uri is
		// preserved by the mapper) before mapping into SocialPost.
		const seen = new Set< string >();
		const deduped: AtmosphereFeedItem[] = [];
		for ( const post of feed.data?.pages.flatMap( ( page ) => page.items ?? [] ) ?? [] ) {
			if ( ! post?.uri || seen.has( post.uri ) ) {
				continue;
			}
			seen.add( post.uri );
			deduped.push( post );
		}
		return deduped.map( mapAtmosphereFeedItemToSocialPost );
	}, [ feed.data ] );

	const handleHeaderRetry = useCallback( () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_atmosphere_profile_retry_clicked', {
				connection_id: connection.id,
				actor,
				error_kind: profile.error?.kind ?? 'unknown',
				surface: 'header',
			} )
		);
		profile.refetch();
	}, [ connection.id, actor, profile, dispatch ] );

	const handleFeedRetry = useCallback( () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_atmosphere_profile_retry_clicked', {
				connection_id: connection.id,
				actor,
				error_kind: feed.error?.kind ?? 'unknown',
				surface: 'feed',
			} )
		);
		feed.refetch();
	}, [ connection.id, actor, feed, dispatch ] );

	const handleBackToTimeline = useCallback( () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_atmosphere_profile_back_to_timeline_clicked', {
				connection_id: connection.id,
				actor,
			} )
		);
	}, [ connection.id, actor, dispatch ] );

	const onClickAnalytics = useCallback(
		( event: string, props: Record< string, unknown > ) => {
			// Shared post-card subcomponents emit
			// `calypso_reader_atmosphere_timeline_*` events. The profile
			// surface rewrites that prefix to `_profile_` so dashboards can
			// split by surface. Anchor on the full prefix so an event whose
			// payload happens to contain `_timeline_` elsewhere isn't
			// rewritten by accident.
			const TIMELINE_PREFIX = 'calypso_reader_atmosphere_timeline_';
			const PROFILE_PREFIX = 'calypso_reader_atmosphere_profile_';
			const reprefixed = event.startsWith( TIMELINE_PREFIX )
				? PROFILE_PREFIX + event.slice( TIMELINE_PREFIX.length )
				: event;
			dispatch( recordReaderTracksEvent( reprefixed, { ...props, actor } ) );
		},
		[ dispatch, actor ]
	);

	const buildThreadUrl = useCallback(
		( uri: string ) => getThreadUrl( connection.id, uri ),
		[ connection.id ]
	);

	const buildProfileUrl = useCallback(
		( ref: { did?: string | null; handle?: string | null } ) => getProfileUrl( connection.id, ref ),
		[ connection.id ]
	);

	const buildTagUrl = useCallback(
		( tag: string ) => getTagFeedUrl( connection.id, tag ),
		[ connection.id ]
	);

	const renderItem = useCallback(
		( post: SocialPost ) => <SocialPostCard post={ post } variant="default" />,
		[]
	);
	const itemKey = useCallback( ( post: SocialPost ) => post.uri, [] );

	const stats: SocialProfileStat[] = profile.data
		? [
				{
					key: 'followers',
					count: profile.data.counts.followers,
					label: translate( 'follower', 'followers', {
						count: profile.data.counts.followers,
					} ),
				},
				{
					key: 'follows',
					count: profile.data.counts.follows,
					label: translate( 'following', {
						context: 'profile stats: count of accounts followed',
					} ),
				},
				{
					key: 'posts',
					count: profile.data.counts.posts,
					label: translate( 'post', 'posts', { count: profile.data.counts.posts } ),
				},
		  ]
		: [];

	const analyticsValue = useMemo(
		() => ( {
			source: 'atmosphere' as const,
			connectionId: connection.id,
			onClick: onClickAnalytics,
			getThreadUrl: buildThreadUrl,
			getProfileUrl: buildProfileUrl,
			getTagUrl: buildTagUrl,
		} ),
		[ connection.id, onClickAnalytics, buildThreadUrl, buildProfileUrl, buildTagUrl ]
	);

	const renderHeaderError = ( error: AtmosphereError ) => {
		const noRetry = new Set< AtmosphereError[ 'kind' ] >( [
			'auth_required',
			'auth_failed',
			'not_found',
			'connection_not_found',
			'bad_request',
			'invalid_handle',
			'invalid_credentials',
		] );
		const showRetry = ! noRetry.has( error.kind );
		const titleByKind: Partial< Record< AtmosphereError[ 'kind' ], TranslateResult > > = {
			not_found: translate( 'Profile not found' ),
			auth_required: translate( 'Reconnect needed' ),
			rate_limited: translate( 'Slow down' ),
			upstream_unavailable: translate( 'Bluesky unreachable' ),
		};
		return (
			<EmptyContent
				title={ titleByKind[ error.kind ] ?? translate( 'Couldn’t load profile' ) }
				line={ errorMessage( error, translate ) }
				action={ showRetry ? translate( 'Retry' ) : undefined }
				actionCallback={ showRetry ? handleHeaderRetry : undefined }
			/>
		);
	};

	const renderHeaderBody = ( profileData: AtmosphereAuthorProfile ) => {
		return (
			<SocialProfileCard
				avatar={ profileData.avatar }
				banner={ profileData.banner }
				displayName={ profileData.display_name ?? undefined }
				handle={ profileData.handle }
				bioHtml={ profileData.description_html }
				stats={ stats }
				statsLabel={ String( translate( 'Profile stats' ) ) }
			/>
		);
	};

	const renderHeader = () => {
		if ( profile.isPending ) {
			return <SocialProfileHeaderSkeleton />;
		}
		if ( profile.isError && profile.error ) {
			return renderHeaderError( profile.error );
		}
		if ( profile.data ) {
			return renderHeaderBody( profile.data );
		}
		return null;
	};

	const emptyHandle = profile.data?.handle ?? actor;

	return (
		<SocialAnalyticsProvider value={ analyticsValue }>
			<VStack spacing={ 4 } className="atmosphere-author-profile">
				<AuthorProfileHeader
					timelineUrl={ getTimelineUrl( connection.id ) }
					onBackToTimeline={ handleBackToTimeline }
				/>
				{ renderHeader() }
				<AuthorProfileTabs connectionId={ connection.id } actor={ actor } activeFilter={ filter } />
				<SocialFeedList< SocialPost >
					items={ items }
					isPending={ feed.isPending }
					isError={ feed.isError }
					error={ projectAtmosphereError( feed.error ) }
					hasNextPage={ Boolean( feed.hasNextPage ) }
					isFetchingNextPage={ feed.isFetchingNextPage }
					fetchNextPage={ feed.fetchNextPage }
					refetch={ handleFeedRetry }
					renderItem={ renderItem }
					itemKey={ itemKey }
					emptyTitle={ buildEmptyTitle( filter, emptyHandle, translate ) }
					emptyLine=""
					protocolLabel="Bluesky"
					protocolHomeURL="/reader/atmosphere"
					protocolHomeLabel={ translate( 'Back to ATmosphere' ) }
				/>
			</VStack>
		</SocialAnalyticsProvider>
	);
}
