import { readerMastodonKeys } from '@automattic/api-core';
import {
	followMastodonActorMutation,
	normalizeMastodonActor,
	unfollowMastodonActorMutation,
	useMastodonActorFollowingInfiniteQuery,
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
	SocialAccountListHeader,
	type SocialAccountListProps,
	type SocialAccountRowProps,
} from 'calypso/reader/social';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import { projectMastodonError } from './error-projection';
import { HiddenCollectionsMessage, PartialCollectionsNotice } from './profile-collections-notice';
import { followErrorMessage } from './profile-errors';
import { getProfileUrl } from './route';
import type { MastodonAccountSummary, MastodonError } from '@automattic/api-core';

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

	// See followers-view for the rationale; same short-circuit applies to
	// the following collection when the actor has hidden their social graph.
	const hideCollections = profileQuery.data?.hide_collections === true;

	const followingQuery = useMastodonActorFollowingInfiniteQuery( {
		connectionId,
		actor,
		enabled: ! hideCollections,
	} );
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

	const query: SocialAccountListProps< MastodonAccountSummary >[ 'query' ] = useMemo(
		() => ( {
			data: followingData,
			isPending: followingIsPending,
			isError: followingIsError,
			error: projectMastodonError( followingError ),
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

	const followMut = useMutation( followMastodonActorMutation( queryClient ) );
	const unfollowMut = useMutation( unfollowMastodonActorMutation( queryClient ) );

	// Scope the error-notice id to `(connectionId, rowActor)` so a successful
	// click on one row only dismisses its own stale toast, not another row's
	// unresolved error (or one posted by a sibling surface).
	const noticeIdFor = useCallback(
		( rowActor: string ) => `mastodon-follow-error-${ connectionId }-${ rowActor }`,
		[ connectionId ]
	);
	const showFollowError = useCallback(
		( error: MastodonError, action: 'follow' | 'unfollow', rowActor: string ) => {
			dispatch(
				errorNotice( followErrorMessage( error, action, translate ), {
					id: noticeIdFor( rowActor ),
				} )
			);
		},
		[ dispatch, translate, noticeIdFor ]
	);
	const dismissFollowError = useCallback(
		( rowActor: string ) => {
			dispatch( removeNotice( noticeIdFor( rowActor ) ) );
		},
		[ dispatch, noticeIdFor ]
	);

	const invalidateActorList = useCallback( () => {
		queryClient.invalidateQueries( {
			queryKey: readerMastodonKeys.actorFollowing( connectionId, normalizeMastodonActor( actor ) ),
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
										dismissFollowError( item.handle );
										invalidateActorList();
									},
									onError: ( error ) => showFollowError( error, 'follow', item.handle ),
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
										dismissFollowError( item.handle );
										invalidateActorList();
									},
									onError: ( error ) => showFollowError( error, 'unfollow', item.handle ),
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
					translate( 'Following · %(actor)s ‹ Mastodon ‹ Reader', {
						args: { actor },
					} )
				) }
			/>
			<AuthorProfileHeader timelineUrl={ profileHref ?? `/reader/mastodon/${ connectionId }` } />
			{ hideCollections ? (
				<>
					<SocialAccountListHeader
						displayName={ profileQuery.data?.display_name ?? null }
						handle={ profileQuery.data?.acct ?? actor }
						count={ profileQuery.data?.counts.following ?? null }
						mode="following"
						isPending={ profileQuery.isPending }
					/>
					<HiddenCollectionsMessage />
				</>
			) : (
				<>
					<SocialAccountList< MastodonAccountSummary >
						query={ query }
						renderItem={ renderItem }
						itemKey={ ( item ) => item.id }
						emptyTitle={ String( translate( 'Not following anyone yet' ) ) }
						emptyLine={ String(
							translate( 'When %(actor)s follows someone, they will appear here.', {
								args: { actor },
							} )
						) }
						protocolLabel="Mastodon"
						protocolHomeURL="/reader/mastodon"
						protocolHomeLabel={ String( translate( 'Back to Mastodon' ) ) }
						header={ {
							displayName: profileQuery.data?.display_name ?? null,
							handle: profileQuery.data?.acct ?? actor,
							count: profileQuery.data?.counts.following ?? null,
							mode: 'following',
							isPending: profileQuery.isPending,
						} }
					/>
					<PartialCollectionsNotice
						profileUrl={ profileQuery.data?.url ?? null }
						mode="following"
					/>
				</>
			) }
		</ReaderMain>
	);
}

export default FollowingView;
