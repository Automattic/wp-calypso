import { readerMastodonKeys } from '@automattic/api-core';
import {
	followMastodonActorMutation,
	normalizeMastodonActor,
	unfollowMastodonActorMutation,
	useMastodonActorFollowersInfiniteQuery,
	useMastodonAuthorProfileQuery,
	useMastodonConnectionsQuery,
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
import { projectMastodonError } from './error-projection';
import { followErrorMessage } from './profile-errors';
import { getProfileUrl } from './route';
import type { MastodonAccountSummary, MastodonError } from '@automattic/api-core';

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
	} = useMastodonConnectionsQuery();
	const connection = useMemo(
		() => connectionsData?.connections.find( ( c ) => c.id === connectionId ) ?? null,
		[ connectionsData, connectionId ]
	);

	useEffect( () => {
		if ( connectionsPending || connectionsError ) {
			return;
		}
		if ( ! connection ) {
			page.replace( '/reader/mastodon' );
		}
	}, [ connectionsPending, connectionsError, connection ] );

	const profileQuery = useMastodonAuthorProfileQuery( connectionId, actor );
	const followersQuery = useMastodonActorFollowersInfiniteQuery( { connectionId, actor } );
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

	// Project the MastodonError union onto SocialError before handing the
	// query to SocialAccountList, mirroring the timeline / profile surfaces.
	const query: SocialAccountListProps< MastodonAccountSummary >[ 'query' ] = useMemo(
		() => ( {
			data: followersData,
			isPending: followersIsPending,
			isError: followersIsError,
			error: projectMastodonError( followersError ),
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

	const followMut = useMutation( followMastodonActorMutation( queryClient ) );
	const unfollowMut = useMutation( unfollowMastodonActorMutation( queryClient ) );

	// Surface follow / unfollow failures via a stable notice id so a stale
	// toast from one click is dismissed when the user retries.
	const showFollowError = useCallback(
		( error: MastodonError, action: 'follow' | 'unfollow' ) => {
			dispatch(
				errorNotice( followErrorMessage( error, action, translate ), {
					id: 'mastodon-follow-error',
				} )
			);
		},
		[ dispatch, translate ]
	);
	const dismissFollowError = useCallback( () => {
		dispatch( removeNotice( 'mastodon-follow-error' ) );
	}, [ dispatch ] );

	// Refetch the actor list after a follow / unfollow so the row's `viewer`
	// state mirrors server truth. Without this, the row keeps the pre-click
	// state until staleTime expires — the existing follow mutation only
	// patches the scoped-profile cache (which this view doesn't read).
	const invalidateActorList = useCallback( () => {
		queryClient.invalidateQueries( {
			queryKey: readerMastodonKeys.actorFollowers( connectionId, normalizeMastodonActor( actor ) ),
		} );
	}, [ queryClient, connectionId, actor ] );

	const renderItem = ( item: MastodonAccountSummary ): SocialAccountRowProps => {
		const isSelf = item.is_self;
		const isFollowing = item.viewer.following;
		const isRequested = item.viewer.requested;
		const isPending =
			( followMut.isPending && followMut.variables?.accountId === item.id ) ||
			( unfollowMut.isPending && unfollowMut.variables?.accountId === item.id );

		const profileHref =
			getProfileUrl( connectionId, item.handle ) ??
			( connection
				? `https://${ encodeURIComponent( connection.instance ) }/@${ encodeURIComponent(
						item.acct
				  ) }`
				: '#' );

		return {
			avatarUrl: item.avatar,
			displayName: item.display_name || item.handle,
			handle: item.handle,
			biography: item.note_text,
			profileHref,
			isSelf,
			followState: isSelf
				? undefined
				: {
						isFollowing,
						isFollowedBy: item.viewer.followed_by,
						isRequested,
						isPending,
						onFollow: () =>
							followMut.mutate(
								{
									connectionId,
									actor: item.handle,
									accountId: item.id,
									locked: item.locked,
								},
								{
									onSuccess: () => {
										dismissFollowError();
										invalidateActorList();
									},
									onError: ( error ) => showFollowError( error, 'follow' ),
								}
							),
						onUnfollow: () =>
							unfollowMut.mutate(
								{
									connectionId,
									actor: item.handle,
									accountId: item.id,
								},
								{
									onSuccess: () => {
										dismissFollowError();
										invalidateActorList();
									},
									onError: ( error ) => showFollowError( error, 'unfollow' ),
								}
							),
				  },
		};
	};

	const profileHref = getProfileUrl( connectionId, actor );

	if ( connectionsError ) {
		return (
			<ReaderMain className="mastodon-view">
				<EmptyContent
					title={ String( translate( 'Couldn’t load your Mastodon connection' ) ) }
					line={ String( translate( 'Something went wrong.' ) ) }
				/>
			</ReaderMain>
		);
	}

	if ( ! connection ) {
		return null;
	}

	return (
		<ReaderMain className="mastodon-view">
			<DocumentHead
				title={ String(
					translate( 'Followers · %(actor)s ‹ Mastodon ‹ Reader', {
						args: { actor },
					} )
				) }
			/>
			<AuthorProfileHeader timelineUrl={ profileHref ?? `/reader/mastodon/${ connectionId }` } />
			<SocialAccountList< MastodonAccountSummary >
				query={ query }
				renderItem={ renderItem }
				itemKey={ ( item ) => item.id }
				emptyTitle={ String( translate( 'No followers yet' ) ) }
				emptyLine={ String(
					translate( 'When someone follows %(actor)s, they will appear here.', {
						args: { actor },
					} )
				) }
				protocolLabel="Mastodon"
				protocolHomeURL="/reader/mastodon"
				protocolHomeLabel={ String( translate( 'Back to Mastodon' ) ) }
				header={ {
					displayName: profileQuery.data?.display_name ?? null,
					handle: profileQuery.data?.acct ?? actor,
					count: profileQuery.data?.counts.followers ?? null,
					mode: 'followers',
					isPending: profileQuery.isPending,
				} }
			/>
		</ReaderMain>
	);
}

export default FollowersView;
