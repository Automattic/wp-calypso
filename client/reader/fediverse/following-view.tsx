import { readerFediverseKeys } from '@automattic/api-core';
import {
	followFediverseActorMutation,
	normalizeFediverseActor,
	unfollowFediverseActorMutation,
	useFediverseActorFollowingInfiniteQuery,
	useFediverseAuthorProfileQuery,
	useFediverseConnectionsQuery,
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
import { projectFediverseError } from './error-projection';
import { followErrorMessage } from './profile-errors';
import { getProfileUrl } from './route';
import type { FediverseAccountSummary, FediverseError } from '@automattic/api-core';

interface Props {
	connectionId: number;
	actor: string;
}

export function FollowingView( { connectionId, actor }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const {
		data: connectionsData,
		isPending: connectionsPending,
		isError: connectionsError,
	} = useFediverseConnectionsQuery();
	const connection = useMemo(
		() => connectionsData?.connections.find( ( c ) => c.id === connectionId ) ?? null,
		[ connectionsData, connectionId ]
	);

	useEffect( () => {
		if ( connectionsPending || connectionsError ) {
			return;
		}
		if ( ! connection ) {
			page.replace( '/reader/fediverse' );
		}
	}, [ connectionsPending, connectionsError, connection ] );

	const profileQuery = useFediverseAuthorProfileQuery( connectionId, actor );
	const followingQuery = useFediverseActorFollowingInfiniteQuery( { connectionId, actor } );
	const {
		data: followingData,
		isPending: followingIsPending,
		isError: followingIsError,
		error: followingError,
		hasNextPage: followingHasNextPage,
		isFetchingNextPage: followingIsFetchingNextPage,
		fetchNextPage: followingFetchNextPage,
		refetch: followingRefetch,
	} = followingQuery;

	const query: SocialAccountListProps< FediverseAccountSummary >[ 'query' ] = useMemo(
		() => ( {
			data: followingData,
			isPending: followingIsPending,
			isError: followingIsError,
			error: projectFediverseError( followingError ),
			hasNextPage: followingHasNextPage,
			isFetchingNextPage: followingIsFetchingNextPage,
			fetchNextPage: () => {
				followingFetchNextPage();
			},
			refetch: () => {
				followingRefetch();
			},
		} ),
		[
			followingData,
			followingIsPending,
			followingIsError,
			followingError,
			followingHasNextPage,
			followingIsFetchingNextPage,
			followingFetchNextPage,
			followingRefetch,
		]
	);

	const followMut = useMutation( followFediverseActorMutation( queryClient ) );
	const unfollowMut = useMutation( unfollowFediverseActorMutation( queryClient ) );

	const showFollowError = useCallback(
		( error: FediverseError, action: 'follow' | 'unfollow' ) => {
			dispatch(
				errorNotice( followErrorMessage( error, action, translate ), {
					id: 'fediverse-follow-error',
				} )
			);
		},
		[ dispatch, translate ]
	);
	const dismissFollowError = useCallback( () => {
		dispatch( removeNotice( 'fediverse-follow-error' ) );
	}, [ dispatch ] );

	const invalidateActorList = useCallback( () => {
		queryClient.invalidateQueries( {
			queryKey: readerFediverseKeys.actorFollowing(
				connectionId,
				normalizeFediverseActor( actor )
			),
		} );
	}, [ queryClient, connectionId, actor ] );

	const renderItem = ( item: FediverseAccountSummary ): SocialAccountRowProps => {
		const isSelf = item.is_self;
		const isFollowing = item.viewer.following;
		const isRequested = item.viewer.requested;
		const isPending =
			( followMut.isPending && followMut.variables?.actor === item.handle ) ||
			( unfollowMut.isPending && unfollowMut.variables?.actor === item.handle );

		const profileHref = getProfileUrl( connectionId, item.handle ) || item.id || '#';

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
			<ReaderMain className="fediverse-view">
				<EmptyContent
					title={ String( translate( 'Couldn’t load your Fediverse connection' ) ) }
					line={ String( translate( 'Something went wrong.' ) ) }
				/>
			</ReaderMain>
		);
	}

	if ( ! connection ) {
		return null;
	}

	return (
		<ReaderMain className="fediverse-view">
			<DocumentHead
				title={ String(
					translate( 'Following · %(actor)s ‹ Fediverse ‹ Reader', {
						args: { actor },
					} )
				) }
			/>
			<AuthorProfileHeader timelineUrl={ profileHref } />
			<SocialAccountList< FediverseAccountSummary >
				query={ query }
				renderItem={ renderItem }
				itemKey={ ( item ) => item.id }
				emptyTitle={ String( translate( 'Not following anyone yet' ) ) }
				emptyLine={ String(
					translate( 'When %(actor)s follows someone, they will appear here.', {
						args: { actor },
					} )
				) }
				protocolLabel="Fediverse"
				protocolHomeURL="/reader/fediverse"
				protocolHomeLabel={ String( translate( 'Back to Fediverse' ) ) }
				header={ {
					displayName: profileQuery.data?.display_name ?? null,
					handle: profileQuery.data?.acct ?? actor,
					count: profileQuery.data?.counts.following ?? null,
					mode: 'following',
					isPending: profileQuery.isPending,
				} }
			/>
		</ReaderMain>
	);
}

export default FollowingView;
