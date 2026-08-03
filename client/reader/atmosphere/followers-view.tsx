import {
	followAtmosphereActorMutation,
	unfollowAtmosphereActorMutation,
	useAtmosphereActorFollowersInfiniteQuery,
	useAtmosphereScopedProfileQuery,
	useConnectionsQuery,
} from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import EmptyContent from 'calypso/components/empty-content';
import ReaderMain from 'calypso/reader/components/reader-main';
import {
	AuthorProfileHeader,
	SocialAccountList,
	type SocialAccountListProps,
	type SocialAccountRowProps,
} from 'calypso/reader/social';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import { projectAtmosphereError } from './error-projection';
import { followErrorMessage } from './profile-errors';
import { DID_RE, getBlueskyProfileUrl, getProfileUrl } from './route';
import type { AtmosphereError, AtmosphereScopedProfileSummary } from '@automattic/api-core';

interface Props {
	connectionId: number;
	actor: string;
}

export function FollowersView( { connectionId, actor }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const {
		data: connectionsData,
		isPending: connectionsPending,
		isError: connectionsError,
	} = useConnectionsQuery();
	const connection = useMemo(
		() => connectionsData?.connections.find( ( c ) => c.id === connectionId ) ?? null,
		[ connectionsData, connectionId ]
	);

	useEffect( () => {
		if ( connectionsPending || connectionsError ) {
			return;
		}
		if ( ! connection ) {
			page.replace( '/reader/atmosphere' );
		}
	}, [ connectionsPending, connectionsError, connection ] );

	const profileQuery = useAtmosphereScopedProfileQuery( { connectionId, actor } );
	const followersQuery = useAtmosphereActorFollowersInfiniteQuery( { connectionId, actor } );
	const {
		data: followersData,
		isPending: followersIsPending,
		isError: followersIsError,
		error: followersError,
		hasNextPage: followersHasNextPage,
		isFetchingNextPage: followersIsFetchingNextPage,
		fetchNextPage: followersFetchNextPage,
		refetch: followersRefetch,
	} = followersQuery;

	// Project the AtmosphereError union onto SocialError before handing the
	// query to SocialAccountList. Atmosphere has variants (auth_failed,
	// invalid_handle, etc.) that don't exist on the protocol-agnostic
	// SocialError used by SocialFeedList's empty-state vocabulary.
	const query: SocialAccountListProps< AtmosphereScopedProfileSummary >[ 'query' ] = useMemo(
		() => ( {
			data: followersData,
			isPending: followersIsPending,
			isError: followersIsError,
			error: projectAtmosphereError( followersError ),
			hasNextPage: followersHasNextPage,
			isFetchingNextPage: followersIsFetchingNextPage,
			fetchNextPage: () => {
				followersFetchNextPage();
			},
			refetch: () => {
				followersRefetch();
			},
		} ),
		[
			followersData,
			followersIsPending,
			followersIsError,
			followersError,
			followersHasNextPage,
			followersIsFetchingNextPage,
			followersFetchNextPage,
			followersRefetch,
		]
	);

	const followMutation = useMutation( followAtmosphereActorMutation( queryClient ) );
	const unfollowMutation = useMutation( unfollowAtmosphereActorMutation( queryClient ) );

	// Surface follow / unfollow failures via the same notice id that
	// AuthorProfilePanel uses, so a stale toast from one panel is
	// dismissed when the user retries from another.
	const showFollowError = useCallback(
		( error: AtmosphereError, action: 'follow' | 'unfollow' ) => {
			dispatch(
				errorNotice( followErrorMessage( error, action, translate ), {
					id: 'atmosphere-follow-error',
				} )
			);
		},
		[ dispatch, translate ]
	);
	const dismissFollowError = useCallback( () => {
		dispatch( removeNotice( 'atmosphere-follow-error' ) );
	}, [ dispatch ] );

	const ownerDid = connection?.did ?? null;

	const renderItem = ( item: AtmosphereScopedProfileSummary ): SocialAccountRowProps => {
		const isSelf = ownerDid !== null && item.did === ownerDid;
		const isFollowing = Boolean( item.viewer.following ) && item.viewer.following !== 'pending';
		const isPendingFollow =
			item.viewer.following === 'pending' ||
			( followMutation.isPending && followMutation.variables?.subjectDid === item.did ) ||
			( unfollowMutation.isPending && unfollowMutation.variables?.subjectDid === item.did );

		return {
			avatarUrl: item.avatar,
			displayName: item.display_name ?? item.handle,
			handle: item.handle,
			biography: item.description,
			profileHref:
				getProfileUrl( connectionId, { handle: item.handle, did: item.did } ) ??
				getBlueskyProfileUrl( item.handle ),
			isSelf,
			// Every row on this followers list trivially follows the viewer,
			// so the "Follows you" badge would be redundant on every row.
			hideFollowedByBadge: true,
			followState: isSelf
				? undefined
				: {
						isFollowing,
						isFollowedBy: item.viewer.followed_by,
						isPending: isPendingFollow,
						onFollow: () =>
							followMutation.mutate(
								{
									connectionId,
									actor: item.handle,
									subjectDid: item.did,
								},
								{
									onSuccess: dismissFollowError,
									onError: ( error ) => showFollowError( error, 'follow' ),
								}
							),
						onUnfollow: () => {
							// Bail if there's no real rkey yet, or if the row is in the
							// optimistic-pending window. Without this guard, clicking
							// unfollow during the pending window would issue a DELETE
							// against the literal sentinel `'pending'` rkey.
							if (
								! item.viewer.following_rkey ||
								item.viewer.following_rkey === 'pending' ||
								isPendingFollow
							) {
								return;
							}
							unfollowMutation.mutate(
								{
									connectionId,
									actor: item.handle,
									rkey: item.viewer.following_rkey,
									subjectDid: item.did,
								},
								{
									onSuccess: dismissFollowError,
									onError: ( error ) => showFollowError( error, 'unfollow' ),
								}
							);
						},
				  },
		};
	};

	const profileRef = DID_RE.test( actor ) ? { did: actor } : { handle: actor };
	const profileHref = getProfileUrl( connectionId, profileRef );

	if ( connectionsError ) {
		// Connections fetch failed: don't pretend the page works. Without
		// this, `connection` stays null and the view renders an empty page
		// with no explanation while the redirect effect bails on the same
		// flag.
		return (
			<ReaderMain className="atmosphere-view">
				<EmptyContent
					title={ String( translate( 'Couldn’t load your ATmosphere connection' ) ) }
					line={ String( translate( 'Something went wrong.' ) ) }
				/>
			</ReaderMain>
		);
	}

	if ( ! connection ) {
		return null;
	}

	return (
		<ReaderMain className="atmosphere-view">
			<DocumentHead
				title={ String(
					translate( 'Followers · @%(actor)s ‹ ATmosphere ‹ Reader', {
						args: { actor },
					} )
				) }
			/>
			<AuthorProfileHeader timelineUrl={ profileHref ?? `/reader/atmosphere/${ connectionId }` } />
			<SocialAccountList< AtmosphereScopedProfileSummary >
				query={ query }
				renderItem={ renderItem }
				itemKey={ ( item ) => item.did }
				emptyTitle={ String( translate( 'No followers yet' ) ) }
				emptyLine={ String(
					translate( 'When someone follows @%(actor)s, they will appear here.', {
						args: { actor },
					} )
				) }
				protocolLabel="ATmosphere"
				protocolHomeURL="https://bsky.app"
				protocolHomeLabel="Bluesky"
				authRequiredCopy={ {
					title: String( translate( "Couldn't load followers" ) ),
					line: String( translate( 'Something went wrong with your Bluesky connection.' ) ),
				} }
				header={ {
					displayName: profileQuery.data?.display_name ?? null,
					handle: profileQuery.data?.handle ?? actor,
					count: profileQuery.data?.counts?.followers ?? null,
					mode: 'followers',
					isPending: profileQuery.isPending,
				} }
			/>
		</ReaderMain>
	);
}

export default FollowersView;
