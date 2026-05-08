import {
	followMastodonActorMutation,
	unfollowMastodonActorMutation,
	useMastodonAuthorFeedInfiniteQuery,
	useMastodonAuthorProfileQuery,
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
	mapMastodonAccountToSocialProfileCardProps,
	mapMastodonFeedItemToSocialPost,
	type SocialPost,
	type SocialProfileStat,
} from 'calypso/reader/social';
import { LikeProvider } from 'calypso/reader/social/components/post-card/like-context';
import { RepostProvider } from 'calypso/reader/social/components/post-card/repost-context';
import { useOptionalComposer } from 'calypso/reader/social/composer';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { MastodonAuthorProfileTabs, useMastodonAuthorFeedFilter } from './author-profile-tabs';
import { projectMastodonError } from './error-projection';
import { errorMessage } from './profile-errors';
import { getProfileUrl, getTagFeedUrl, getThreadUrl, getTimelineUrl } from './route';
import { makeUseMastodonLikeAction } from './use-mastodon-like-action';
import { makeUseMastodonRepostAction } from './use-mastodon-repost-action';
import type {
	MastodonAuthorProfile,
	MastodonConnection,
	MastodonError,
	MastodonFeedItem,
} from '@automattic/api-core';
import type { AppState } from 'calypso/types';
import type { UnknownAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

/**
 * Per-action follow / unfollow error copy. Most error kinds share the
 * profile-load copy because they're rooted in the same backend issue
 * (auth, rate-limit, transport), so we delegate to the shared
 * `errorMessage`. The exception is `not_found`: the shared copy is
 * profile-load-shaped and would mislead the user when an actor
 * disappears between profile load and the follow click.
 */
function followErrorMessage(
	error: MastodonError,
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

interface MastodonAuthorProfilePanelProps {
	connection: MastodonConnection;
	actor: string;
	// URL prefix for the inner filter-tab links — see
	// `MastodonAuthorProfileTabs` for the contract. The connected-user
	// /profile page passes its own path so the tabs stay within /profile;
	// the third-party /profile/:actor route passes the actor-scoped path.
	subtabBasePath: string;
}

export function MastodonAuthorProfilePanel( {
	connection,
	actor,
	subtabBasePath,
}: MastodonAuthorProfilePanelProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();

	const filter = useMastodonAuthorFeedFilter();

	const queryClient = useQueryClient();
	const profile = useMastodonAuthorProfileQuery( connection.id, actor );
	const followMut = useMutation( followMastodonActorMutation( queryClient ) );
	const unfollowMut = useMutation( unfollowMastodonActorMutation( queryClient ) );
	const feed = useMastodonAuthorFeedInfiniteQuery( connection.id, actor, filter );

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
					count: profile.data.counts.following,
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

	// `.mutate` is the only stable handle on the useMutation result; depending
	// on the result object would re-create handleFollow / handleUnfollow on
	// every render.
	const followMutate = followMut.mutate;
	const unfollowMutate = unfollowMut.mutate;

	const showFollowError = useCallback(
		( error: MastodonError, action: 'follow' | 'unfollow', accountId: string ) => {
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_mastodon_profile_follow_error', {
					connection_id: connection.id,
					account_id: accountId,
					action,
					error_kind: error.kind,
				} )
			);
			dispatch(
				errorNotice( followErrorMessage( error, action, translate ), {
					id: 'mastodon-follow-error',
				} )
			);
			// Pipeline-level log so failures stay observable in dashboards
			// even when no Tracks dashboard is consulted.
			logToLogstash( {
				feature: 'calypso_client',
				message: `Reader Mastodon ${ action } mutation failed`,
				severity: 'error',
				extra: {
					type: `reader_mastodon_${ action }_mutation_error`,
					connection_id: connection.id,
					account_id: accountId,
					error_kind: error.kind,
				},
			} );
		},
		[ connection.id, dispatch, translate ]
	);

	const handleFollow = useCallback( () => {
		if ( ! profile.data ) {
			return;
		}
		// Capture at click time so error analytics survive a profile refetch /
		// invalidation racing with the in-flight mutation.
		const accountId = profile.data.id;
		const locked = profile.data.locked;
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_mastodon_profile_follow_clicked', {
				connection_id: connection.id,
				account_id: accountId,
				was_followed_by: profile.data.viewer?.followed_by ?? false,
				was_locked: locked,
			} )
		);
		followMutate(
			{ connectionId: connection.id, actor, accountId, locked },
			{
				onSuccess: () => {
					dispatch( removeNotice( 'mastodon-follow-error' ) );
				},
				onError: ( error ) => showFollowError( error, 'follow', accountId ),
			}
		);
	}, [ profile.data, connection.id, actor, dispatch, followMutate, showFollowError ] );

	const handleUnfollow = useCallback( () => {
		if ( ! profile.data ) {
			return;
		}
		const accountId = profile.data.id;
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_mastodon_profile_unfollow_clicked', {
				connection_id: connection.id,
				account_id: accountId,
				was_requested: profile.data.viewer?.requested ?? false,
			} )
		);
		unfollowMutate(
			{ connectionId: connection.id, actor, accountId },
			{
				onSuccess: () => {
					dispatch( removeNotice( 'mastodon-follow-error' ) );
				},
				onError: ( error ) => showFollowError( error, 'unfollow', accountId ),
			}
		);
	}, [ profile.data, connection.id, actor, dispatch, unfollowMutate, showFollowError ] );

	const renderProfileBody = useCallback(
		( profileData: MastodonAuthorProfile ) => {
			const cardProps = mapMastodonAccountToSocialProfileCardProps( profileData, {
				instance: connection.instance,
			} );

			// Forwards-compat gate: only render the button when the backend
			// has projected the viewer block. Pre-deploy backends omit
			// `viewer` entirely and we hide the button rather than guess at
			// follow state. `is_self` hides the button on the viewer's own
			// profile.
			const followButton =
				profileData.viewer && ! profileData.is_self ? (
					<FollowButton
						isFollowing={ profileData.viewer.following }
						isFollowedBy={ profileData.viewer.followed_by }
						isRequested={ profileData.viewer.requested }
						isPending={ followMut.isPending || unfollowMut.isPending }
						actorHandle={ profileData.acct }
						onFollow={ handleFollow }
						onUnfollow={ handleUnfollow }
					/>
				) : null;

			return (
				<>
					<SocialProfileCard
						{ ...cardProps }
						stats={ stats }
						statsLabel={ String( translate( 'Profile stats' ) ) }
						headerActions={ followButton }
					/>
					<MastodonAuthorProfileTabs
						connectionId={ connection.id }
						actor={ actor }
						basePath={ subtabBasePath }
						activeFilter={ filter }
					/>
				</>
			);
		},
		[
			connection.id,
			connection.instance,
			actor,
			filter,
			stats,
			subtabBasePath,
			translate,
			followMut.isPending,
			unfollowMut.isPending,
			handleFollow,
			handleUnfollow,
		]
	);

	const renderProfileError = useCallback(
		( error: MastodonError, retry: () => void ) => {
			const noRetry = new Set< MastodonError[ 'kind' ] >( [
				'auth_required',
				'auth_failed',
				'not_found',
				'connection_not_found',
				'bad_request',
				'invalid_instance',
			] );
			const showRetry = ! noRetry.has( error.kind );
			const titleByKind: Partial< Record< MastodonError[ 'kind' ], TranslateResult > > = {
				not_found: translate( 'Profile not found' ),
				auth_required: translate( 'Reconnect needed' ),
				rate_limited: translate( 'Slow down' ),
				upstream_unavailable: translate( 'Mastodon unreachable' ),
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
		( profileData: MastodonAuthorProfile ) => ( {
			actor_id: profileData.id,
			actor_handle: profileData.acct,
			// Capture the active filter at first profile-data resolution so
			// dashboards can split "what tab did the user open this profile
			// on". Tab switches don't re-fire profile_viewed.
			initial_filter: filter,
		} ),
		[ filter ]
	);

	const feedItemKey = useCallback( ( item: MastodonFeedItem ) => item.id, [] );

	const mapFeedItem = useCallback(
		( item: MastodonFeedItem ) =>
			mapMastodonFeedItemToSocialPost( item, { instance: connection.instance } ),
		[ connection.instance ]
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

	const buildThreadUrl = useCallback(
		( uri: string ) => getThreadUrl( connection.id, uri ),
		[ connection.id ]
	);

	const buildTagUrl = useCallback(
		( tag: string ) => getTagFeedUrl( connection.id, tag ),
		[ connection.id ]
	);

	// Mastodon-specific empty state: when the account is locked and we have
	// no items, the feed isn't actually empty — we just can't see it without
	// following. Surface that explicitly so the empty state isn't misleading.
	// Gate on feed.isPending AND ! feed.isError so a transient feed error
	// on a locked profile doesn't render as "private" — that'd be a
	// falsehood about a third-party account.
	const items = feed.data?.pages.flatMap( ( page ) => page.items ?? [] ) ?? [];
	const isLockedEmpty =
		profile.data?.locked === true && items.length === 0 && ! feed.isPending && ! feed.isError;
	const emptyHandle = profile.data?.acct ?? actor;

	const useLikeAction = useMemo(
		() => makeUseMastodonLikeAction( connection.id ),
		[ connection.id ]
	);

	const useRepostAction = useMemo(
		() => makeUseMastodonRepostAction( connection.id ),
		[ connection.id ]
	);

	const composer = useOptionalComposer();
	const openComposer = composer?.openComposer;

	const onReplyClick = useMemo( () => {
		if ( ! openComposer ) {
			return undefined;
		}
		return ( post: SocialPost ) => {
			openComposer( {
				kind: 'reply',
				root: { uri: post.uri },
				parent: { uri: post.uri },
				previewPost: post,
			} );
		};
	}, [ openComposer ] );

	const onQuoteClick = useMemo( () => {
		if ( ! openComposer ) {
			return undefined;
		}
		return ( post: SocialPost ) => {
			openComposer( {
				kind: 'quote',
				quote: { uri: post.uri },
				previewPost: post,
			} );
		};
	}, [ openComposer ] );

	return (
		<LikeProvider value={ useLikeAction }>
			<RepostProvider value={ useRepostAction }>
				<SocialAuthorProfilePanel< MastodonAuthorProfile, MastodonError, MastodonFeedItem >
					connectionId={ connection.id }
					actor={ actor }
					timelineUrl={ getTimelineUrl( connection.id ) }
					source="mastodon"
					tracksProtocolPrefix="calypso_reader_mastodon_"
					profile={ profile }
					feed={ feed }
					getProfileViewedProps={ getProfileViewedProps }
					renderProfileBody={ renderProfileBody }
					renderProfileError={ renderProfileError }
					feedItemKey={ feedItemKey }
					mapFeedItem={ mapFeedItem }
					projectFeedError={ projectMastodonError }
					buildProfileUrl={ buildProfileUrl }
					buildThreadUrl={ buildThreadUrl }
					buildTagUrl={ buildTagUrl }
					onReplyClick={ onReplyClick }
					onQuoteClick={ onQuoteClick }
					emptyTitle={
						isLockedEmpty
							? String( translate( 'This account’s posts are private.' ) )
							: String(
									translate( '@%(handle)s hasn’t posted yet.', {
										args: { handle: emptyHandle },
									} )
							  )
					}
					emptyLine={
						isLockedEmpty
							? String(
									translate( 'You need to follow this account on Mastodon to see their posts.' )
							  )
							: String( translate( 'Their feed is empty.' ) )
					}
					emptyActionLabel={ String( translate( 'View on Mastodon' ) ) }
					emptyActionURL={
						profile.data ? `https://${ connection.instance }/@${ profile.data.acct }` : undefined
					}
					protocolLabel="Mastodon"
					protocolHomeURL="/reader/mastodon"
					protocolHomeLabel={ translate( 'Back to Mastodon' ) }
					className="mastodon-author-profile"
					feedDimension={ filter }
				/>
			</RepostProvider>
		</LikeProvider>
	);
}
