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
import { logToLogstash } from 'calypso/lib/logstash';
import ReaderMain from 'calypso/reader/components/reader-main';
import {
	AuthorProfileHeader,
	SocialAccountList,
	stripLeadingAt,
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

	// Scope the error-notice id to `(connectionId, rowActor)` so a successful
	// click on one row only dismisses its own stale toast, not another row's
	// unresolved error. Sibling surfaces (author panel, followers list) keep
	// their own toast space.
	const noticeIdFor = useCallback(
		( rowActor: string ) => `fediverse-follow-error-${ connectionId }-${ rowActor }`,
		[ connectionId ]
	);
	const showFollowError = useCallback(
		( error: FediverseError, action: 'follow' | 'unfollow', rowActor: string ) => {
			dispatch(
				errorNotice( followErrorMessage( error, action, translate ), {
					id: noticeIdFor( rowActor ),
				} )
			);
			// Pipeline-level log so failures stay observable in dashboards even
			// when no Tracks dashboard is consulted. Swallow rejections — the
			// logstash POST going down must not bubble to the global handler.
			logToLogstash( {
				feature: 'calypso_client',
				message: `Reader Fediverse ${ action } mutation failed`,
				severity: 'error',
				extra: {
					type: `reader_fediverse_${ action }_mutation_error`,
					connection_id: connectionId,
					error_kind: error.kind,
				},
			} ).catch( () => undefined );
		},
		[ dispatch, translate, connectionId, noticeIdFor ]
	);
	const dismissFollowError = useCallback(
		( rowActor: string ) => {
			dispatch( removeNotice( noticeIdFor( rowActor ) ) );
		},
		[ dispatch, noticeIdFor ]
	);

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
		// Viewer is optional during the backend rollout window and absent on
		// `is_self` rows; treat its absence as "no follow UI available".
		const viewer = item.viewer;
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
			followState:
				isSelf || ! viewer
					? undefined
					: {
							isFollowing: viewer.following,
							isFollowedBy: viewer.followed_by,
							isRequested: viewer.requested,
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
				authRequiredCopy={ {
					title: String( translate( "Couldn't load list" ) ),
					line: String( translate( 'Something went wrong with your Fediverse connection.' ) ),
				} }
				header={ {
					displayName: profileQuery.data?.display_name ?? null,
					// `acct` carries a leading `@`; the header renders `@${handle}`,
					// so strip first to avoid a double-`@`.
					handle: stripLeadingAt( profileQuery.data?.acct ?? actor ),
					count: profileQuery.data?.counts.following ?? null,
					mode: 'following',
					isPending: profileQuery.isPending,
				} }
			/>
		</ReaderMain>
	);
}

export default FollowingView;
