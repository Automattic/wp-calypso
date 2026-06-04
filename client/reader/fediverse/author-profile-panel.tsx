import {
	followFediverseActorMutation,
	unfollowFediverseActorMutation,
	useFediverseAuthorFeedInfiniteQuery,
	useFediverseAuthorProfileQuery,
} from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import { logToLogstash } from 'calypso/lib/logstash';
import {
	FollowButton,
	SocialAuthorProfilePanel,
	SocialProfileCard,
	mapFediverseAuthorProfileToSocialProfileCardProps,
	mapFediverseFeedItemToSocialPost,
	stripLeadingAt,
	type SocialProfileStat,
} from 'calypso/reader/social';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { projectFediverseError } from './error-projection';
import { errorMessage, followErrorMessage } from './profile-errors';
import { FEDIVERSE_REACTIONS } from './reactions-config';
import {
	getFollowersUrl,
	getFollowingUrl,
	getProfileUrl,
	getTimelineUrl,
	hostFromUrl,
} from './route';
import type {
	FediverseAuthorProfile,
	FediverseConnection,
	FediverseError,
	FediverseFeedItem,
} from '@automattic/api-core';
import type { AppState } from 'calypso/types';
import type { UnknownAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

interface FediverseAuthorProfilePanelProps {
	connection: FediverseConnection;
	actor: string;
}

/**
 * Per-protocol wrapper around the shared `<SocialAuthorProfilePanel>`
 * shell. Mirrors `MastodonAuthorProfilePanel`: wires the profile +
 * author-feed queries, supplies the per-protocol error/empty copy, and
 * projects wire shapes onto `SocialPost` / `SocialProfileCardProps`.
 *
 * No filter tabs (Posts/Replies/Media) yet — the Fediverse author-feed
 * endpoint doesn't expose `exclude_replies` / `only_media` toggles in
 * slice 1. Add `feedDimension` and a tab bar when those land.
 */
export function FediverseAuthorProfilePanel( {
	connection,
	actor,
}: FediverseAuthorProfilePanelProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
	const queryClient = useQueryClient();

	const profile = useFediverseAuthorProfileQuery( connection.id, actor );
	const feed = useFediverseAuthorFeedInfiniteQuery( connection.id, actor );

	const followMut = useMutation( followFediverseActorMutation( queryClient ) );
	const unfollowMut = useMutation( unfollowFediverseActorMutation( queryClient ) );
	// `.mutate` is the only stable handle on the useMutation result — depending
	// on the result object would re-create handleFollow / handleUnfollow on
	// every render (mirrors the Mastodon panel).
	const followMutate = followMut.mutate;
	const unfollowMutate = unfollowMut.mutate;

	// Scope the error-notice id to `(connectionId, actor)` so a successful
	// follow on one surface doesn't silently dismiss an unresolved error
	// toast posted by a different surface (the followers / following lists
	// share the same notice space). Same pattern as the Mastodon panel.
	const noticeId = `fediverse-follow-error-${ connection.id }-${ actor }`;

	const showFollowError = useCallback(
		( error: FediverseError, action: 'follow' | 'unfollow' ) => {
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_fediverse_profile_follow_error', {
					connection_id: connection.id,
					action,
					error_kind: error.kind,
				} )
			);
			dispatch(
				errorNotice( followErrorMessage( error, action, translate ), {
					id: noticeId,
				} )
			);
			// Pipeline-level log so failures stay observable in dashboards even
			// when no Tracks dashboard is consulted (matches the Mastodon panel).
			// Swallow rejections — the logstash POST going down must not bubble
			// to the global handler, which is exactly the silent failure this
			// breadcrumb exists to surface.
			logToLogstash( {
				feature: 'calypso_client',
				message: `Reader Fediverse ${ action } mutation failed`,
				severity: 'error',
				extra: {
					type: `reader_fediverse_${ action }_mutation_error`,
					connection_id: connection.id,
					error_kind: error.kind,
				},
			} ).catch( () => undefined );
		},
		[ connection.id, dispatch, translate, noticeId ]
	);

	const handleFollow = useCallback( () => {
		if ( ! profile.data ) {
			return;
		}
		// Capture at click time so analytics survive a profile refetch racing
		// with the in-flight mutation.
		const locked = profile.data.locked;
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_fediverse_profile_follow_clicked', {
				connection_id: connection.id,
				was_followed_by: profile.data.viewer?.followed_by ?? false,
				was_locked: locked,
			} )
		);
		followMutate(
			{ connectionId: connection.id, actor, locked },
			{
				onSuccess: () => {
					dispatch( removeNotice( noticeId ) );
				},
				onError: ( error ) => showFollowError( error, 'follow' ),
			}
		);
	}, [ profile.data, connection.id, actor, dispatch, followMutate, showFollowError, noticeId ] );

	const handleUnfollow = useCallback( () => {
		if ( ! profile.data ) {
			return;
		}
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_fediverse_profile_unfollow_clicked', {
				connection_id: connection.id,
				was_requested: profile.data.viewer?.requested ?? false,
			} )
		);
		unfollowMutate(
			{ connectionId: connection.id, actor },
			{
				onSuccess: () => {
					dispatch( removeNotice( noticeId ) );
				},
				onError: ( error ) => showFollowError( error, 'unfollow' ),
			}
		);
	}, [ profile.data, connection.id, actor, dispatch, unfollowMutate, showFollowError, noticeId ] );

	// Connection's home host — feeds the mapper's webfinger qualifier
	// so local-account `acct` values render as `@user@host`. Falls back
	// to the webfinger's host when the URL fails to parse.
	const host = hostFromUrl( connection.url ) ?? connection.webfinger.split( '@' ).pop() ?? '';

	const stats: SocialProfileStat[] = useMemo( () => {
		if ( ! profile.data ) {
			return [];
		}
		// Followers / following list views only support the connected
		// account's own actor today (the backend slice for third-party
		// actor lists hasn't shipped yet). Skip the `href` on non-self
		// profiles so the counts render as plain text instead of dead
		// links. Drop the `is_self` gate when third-party list support lands.
		const isSelf = profile.data.is_self;
		return [
			{
				key: 'followers',
				count: profile.data.counts.followers,
				label: translate( 'follower', 'followers', {
					count: profile.data.counts.followers,
				} ),
				href: isSelf ? getFollowersUrl( connection.id, actor ) : undefined,
			},
			{
				key: 'follows',
				count: profile.data.counts.following,
				label: translate( 'following', {
					context: 'profile stats: count of accounts followed',
				} ),
				href: isSelf ? getFollowingUrl( connection.id, actor ) : undefined,
			},
			{
				key: 'posts',
				count: profile.data.counts.posts,
				label: translate( 'post', 'posts', { count: profile.data.counts.posts } ),
			},
		];
	}, [ profile.data, translate, connection.id, actor ] );

	const renderProfileBody = useCallback(
		( profileData: FediverseAuthorProfile ) => {
			const cardProps = mapFediverseAuthorProfileToSocialProfileCardProps( profileData, {
				host,
			} );
			// Forwards-compat gate: only render the button when the backend
			// has projected the viewer block. Pre-deploy backends omit
			// `viewer` entirely and we hide the button rather than guess at
			// follow state. `is_self` hides the button on the viewer's own
			// profile. Mirrors the Mastodon panel.
			const followButton =
				profileData.viewer && ! profileData.is_self ? (
					<FollowButton
						isFollowing={ profileData.viewer.following }
						isFollowedBy={ profileData.viewer.followed_by }
						isRequested={ profileData.viewer.requested }
						isPending={ followMut.isPending || unfollowMut.isPending }
						actorHandle={ stripLeadingAt( profileData.acct ) }
						onFollow={ handleFollow }
						onUnfollow={ handleUnfollow }
					/>
				) : null;
			return (
				<SocialProfileCard
					{ ...cardProps }
					stats={ stats }
					statsLabel={ String( translate( 'Profile stats' ) ) }
					headerActions={ followButton }
				/>
			);
		},
		[
			host,
			stats,
			translate,
			followMut.isPending,
			unfollowMut.isPending,
			handleFollow,
			handleUnfollow,
		]
	);

	const renderProfileError = useCallback(
		( error: FediverseError, retry: () => void ) => {
			const noRetry = new Set< FediverseError[ 'kind' ] >( [
				'not_found',
				'connection_not_found',
			] );
			const showRetry = ! noRetry.has( error.kind );
			const titleByKind: Partial< Record< FediverseError[ 'kind' ], TranslateResult > > = {
				not_found: translate( 'Profile not found' ),
				rate_limited: translate( 'Slow down' ),
				upstream_unavailable: translate( 'Fediverse unreachable' ),
			};
			return (
				<EmptyContent
					title={ titleByKind[ error.kind ] ?? translate( 'Couldn’t load profile' ) }
					line={ errorMessage( error, translate ) }
					action={ showRetry ? translate( 'Retry' ) : undefined }
					actionCallback={ showRetry ? retry : undefined }
				/>
			);
		},
		[ translate ]
	);

	const getProfileViewedProps = useCallback(
		( profileData: FediverseAuthorProfile ) => ( {
			actor_id: profileData.id,
			// Wire `acct` carries a leading `@`; Tracks dashboards expect the
			// bare `user@host` shape used by the atmosphere/Mastodon adapters.
			actor_handle: stripLeadingAt( profileData.acct ),
		} ),
		[]
	);

	const feedItemKey = useCallback( ( item: FediverseFeedItem ) => item.id, [] );

	const mapFeedItem = useCallback(
		( item: FediverseFeedItem ) => mapFediverseFeedItemToSocialPost( item, { host } ),
		[ host ]
	);

	const buildProfileUrl = useCallback(
		( ref: { id?: string | null; handle?: string | null } ) => {
			if ( ref.handle ) {
				return getProfileUrl( connection.id, ref.handle );
			}
			if ( ref.id ) {
				return getProfileUrl( connection.id, ref.id );
			}
			return null;
		},
		[ connection.id ]
	);

	// No in-app thread surface yet — return null so post-card's link
	// surfaces (timestamp, replies count, etc.) fall back to the
	// permalink href.
	const buildThreadUrl = useCallback( () => null, [] );

	// `profile.data.acct` carries a leading `@`; the empty-title format
	// `'@%(handle)s …'` already prepends `@`, so strip to avoid `@@user@host`.
	const emptyHandle = stripLeadingAt( profile.data?.acct ?? actor );

	return (
		<SocialAuthorProfilePanel< FediverseAuthorProfile, FediverseError, FediverseFeedItem >
			connectionId={ connection.id }
			actor={ actor }
			timelineUrl={ getTimelineUrl( connection.id ) }
			source="fediverse"
			tracksProtocolPrefix="calypso_reader_fediverse_"
			profile={ profile }
			feed={ feed }
			getProfileViewedProps={ getProfileViewedProps }
			renderProfileBody={ renderProfileBody }
			renderProfileError={ renderProfileError }
			feedItemKey={ feedItemKey }
			mapFeedItem={ mapFeedItem }
			projectFeedError={ projectFediverseError }
			buildProfileUrl={ buildProfileUrl }
			buildThreadUrl={ buildThreadUrl }
			emptyTitle={ String(
				translate( '@%(handle)s hasn’t posted yet.', { args: { handle: emptyHandle } } )
			) }
			emptyLine={ String( translate( 'Their feed is empty.' ) ) }
			emptyActionLabel={ String( translate( 'View on the Fediverse' ) ) }
			// Link to the *viewed actor's* profile URL when known, not the
			// connected blog. Falls back to the connection URL only when the
			// profile query hasn't resolved (rare — the empty-state surfaces
			// after a successful profile fetch).
			emptyActionURL={ profile.data?.url || connection.url }
			protocolLabel="Fediverse"
			protocolHomeURL="/reader/fediverse"
			protocolHomeLabel={ translate( 'Back to Fediverse' ) }
			authRequiredCopy={ {
				title: String( translate( "Couldn't load posts" ) ),
				line: String( translate( 'Something went wrong with your Fediverse connection.' ) ),
			} }
			className="fediverse-author-profile"
			reactions={ FEDIVERSE_REACTIONS }
		/>
	);
}
