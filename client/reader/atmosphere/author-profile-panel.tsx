import {
	followAtmosphereActorMutation,
	unfollowAtmosphereActorMutation,
	useAtmosphereScopedAuthorFeedInfiniteQuery,
	useAtmosphereScopedProfileQuery,
} from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import {
	FollowButton,
	SocialAnalyticsProvider,
	SocialFeedList,
	SocialPostCard,
	SocialProfileCard,
	SocialProfileHeaderSkeleton,
	mapAtmosphereFeedItemToSocialPost,
	type SocialPost,
	type SocialProfileStat,
} from 'calypso/reader/social';
import { LikeProvider } from 'calypso/reader/social/components/post-card/like-context';
import { RepostProvider } from 'calypso/reader/social/components/post-card/repost-context';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { AuthorProfileTabs, useAuthorProfileFilter } from './author-profile-tabs';
import { useOptionalComposer } from './composer';
import { projectAtmosphereError } from './error-projection';
import { errorMessage } from './profile-errors';
import { getProfileUrl, getTagFeedUrl, getThreadUrl } from './route';
import { makeUseAtmosphereLikeAction } from './use-atmosphere-like-action';
import { makeUseAtmosphereRepostAction } from './use-atmosphere-repost-action';
import type {
	AtmosphereAuthorFeedFilter,
	AtmosphereScopedProfile,
	AtmosphereConnection,
	AtmosphereError,
	AtmosphereFeedItem,
} from '@automattic/api-core';
import type { AppState } from 'calypso/types';
import type { UnknownAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

/**
 * Action-aware copy for follow / unfollow failure toasts. Most kinds are
 * semantically identical to a profile-load failure (auth, rate limit,
 * upstream), so we delegate to the shared `errorMessage`. The exception is
 * `not_found`: the shared copy is profile-load-shaped and would mislead the
 * user when an actor disappears between profile load and the follow click.
 */
function followErrorMessage(
	error: AtmosphereError,
	action: 'follow' | 'unfollow',
	translate: ReturnType< typeof useTranslate >
): TranslateResult {
	if ( error.kind === 'not_found' ) {
		return action === 'follow'
			? translate( 'Couldn’t follow this account.' )
			: translate( 'Couldn’t unfollow this account.' );
	}
	return errorMessage( error, translate );
}

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
	subtabBasePath: string;
}

export function AuthorProfilePanel( {
	connection,
	actor,
	subtabBasePath,
}: AuthorProfilePanelProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
	const filter = useAuthorProfileFilter();
	const lastErrorKind = useRef< { header: string | null; feed: string | null } >( {
		header: null,
		feed: null,
	} );

	const queryClient = useQueryClient();
	const profile = useAtmosphereScopedProfileQuery( { connectionId: connection.id, actor } );
	const followMut = useMutation( followAtmosphereActorMutation( queryClient ) );
	const unfollowMut = useMutation( unfollowAtmosphereActorMutation( queryClient ) );
	const feed = useAtmosphereScopedAuthorFeedInfiniteQuery( {
		connectionId: connection.id,
		actor,
		filter,
	} );

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
		( post: SocialPost ) => (
			<SocialPostCard post={ post } connectionId={ connection.id } variant="default" />
		),
		[ connection.id ]
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

	const composer = useOptionalComposer();
	const openComposer = composer?.openComposer;
	const onReplyClick = useMemo( () => {
		if ( ! openComposer ) {
			return undefined;
		}
		return ( post: SocialPost ) => {
			if ( ! post.cid ) {
				return;
			}
			const parent = { uri: post.uri, cid: post.cid };
			// See timeline-panel.tsx for the rationale. Prefer the root's
			// own `cid` from `reply_root` so reply-to-reply submissions send
			// the real root strong-ref; fall back to the parent's `cid` for
			// protocols without CIDs or older backend payloads.
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

	const onQuoteClick = useMemo( () => {
		if ( ! openComposer ) {
			return undefined;
		}
		return ( post: SocialPost ) => {
			if ( ! post.cid ) {
				return;
			}
			openComposer( {
				kind: 'quote',
				quote: { uri: post.uri, cid: post.cid },
				previewPost: post,
			} );
		};
	}, [ openComposer ] );

	const analyticsValue = useMemo(
		() => ( {
			source: 'atmosphere' as const,
			connectionId: connection.id,
			onClick: onClickAnalytics,
			getThreadUrl: buildThreadUrl,
			getProfileUrl: buildProfileUrl,
			getTagUrl: buildTagUrl,
			onReplyClick,
			onQuoteClick,
			ownerDid: connection.did,
		} ),
		[
			connection.id,
			connection.did,
			onClickAnalytics,
			buildThreadUrl,
			buildProfileUrl,
			buildTagUrl,
			onReplyClick,
			onQuoteClick,
		]
	);

	const useLikeAction = useMemo(
		() => makeUseAtmosphereLikeAction( connection.id ),
		[ connection.id ]
	);

	const useRepostAction = useMemo(
		() => makeUseAtmosphereRepostAction( connection.id ),
		[ connection.id ]
	);

	const isOwnProfile = profile.data?.did === connection.did;

	// .mutate is the only stable handle on the useMutation result; depending on
	// the result object would re-create handleFollow / handleUnfollow every render.
	const followMutate = followMut.mutate;
	const unfollowMutate = unfollowMut.mutate;

	const showFollowError = useCallback(
		( error: AtmosphereError, action: 'follow' | 'unfollow' ) => {
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_atmosphere_profile_follow_error', {
					connection_id: connection.id,
					actor,
					action,
					error_kind: error.kind,
				} )
			);
			dispatch(
				errorNotice( followErrorMessage( error, action, translate ), {
					id: 'atmosphere-follow-error',
				} )
			);
		},
		[ connection.id, actor, dispatch, translate ]
	);

	const handleFollow = useCallback( () => {
		if ( ! profile.data ) {
			return;
		}
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_atmosphere_profile_follow_clicked', {
				connection_id: connection.id,
				actor,
				actor_did: profile.data.did,
				was_followed_by: profile.data.viewer.followed_by,
			} )
		);
		followMutate(
			{ connectionId: connection.id, actor, subjectDid: profile.data.did },
			{
				onSuccess: () => {
					dispatch( removeNotice( 'atmosphere-follow-error' ) );
				},
				onError: ( error ) => showFollowError( error, 'follow' ),
			}
		);
	}, [ profile.data, connection.id, actor, dispatch, followMutate, showFollowError ] );

	const handleUnfollow = useCallback( () => {
		if ( ! profile.data ) {
			return;
		}
		// AtmosphereProfileFollowState is a discriminated union: once `following`
		// is non-null, `following_rkey` is type-narrowed to string. The button
		// only renders the unfollow action when `following` is non-null, so this
		// guard handles the same edge cases as the follow handler (loading /
		// race) rather than the rkey-coupling invariant.
		if ( profile.data.viewer.following === null ) {
			return;
		}
		const rkey = profile.data.viewer.following_rkey;
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_atmosphere_profile_unfollow_clicked', {
				connection_id: connection.id,
				actor,
				actor_did: profile.data.did,
			} )
		);
		unfollowMutate(
			{ connectionId: connection.id, actor, rkey },
			{
				onSuccess: () => {
					dispatch( removeNotice( 'atmosphere-follow-error' ) );
				},
				onError: ( error ) => showFollowError( error, 'unfollow' ),
			}
		);
	}, [ profile.data, connection.id, actor, dispatch, unfollowMutate, showFollowError ] );

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

	const renderHeaderBody = ( profileData: AtmosphereScopedProfile ) => {
		const followButton = ! isOwnProfile ? (
			<FollowButton
				isFollowing={ profileData.viewer.following !== null }
				isFollowedBy={ profileData.viewer.followed_by }
				isPending={ followMut.isPending || unfollowMut.isPending }
				actorHandle={ profileData.handle }
				onFollow={ handleFollow }
				onUnfollow={ handleUnfollow }
			/>
		) : null;

		return (
			<SocialProfileCard
				avatar={ profileData.avatar }
				banner={ profileData.banner }
				displayName={ profileData.display_name ?? undefined }
				handle={ profileData.handle }
				bioHtml={ profileData.description_html }
				stats={ stats }
				statsLabel={ String( translate( 'Profile stats' ) ) }
				headerActions={ followButton }
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
			<LikeProvider value={ useLikeAction }>
				<RepostProvider value={ useRepostAction }>
					<VStack spacing={ 4 } className="atmosphere-author-profile">
						{ renderHeader() }
						<AuthorProfileTabs
							connectionId={ connection.id }
							actor={ actor }
							basePath={ subtabBasePath }
							activeFilter={ filter }
						/>
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
				</RepostProvider>
			</LikeProvider>
		</SocialAnalyticsProvider>
	);
}
