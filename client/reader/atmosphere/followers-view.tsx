import {
	followAtmosphereActorMutation,
	unfollowAtmosphereActorMutation,
	useAtmosphereActorFollowersInfiniteQuery,
	useConnectionsQuery,
} from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import ReaderMain from 'calypso/reader/components/reader-main';
import {
	AuthorProfileHeader,
	SocialAccountList,
	type SocialAccountListProps,
	type SocialAccountRowProps,
} from 'calypso/reader/social';
import { projectAtmosphereError } from './error-projection';
import { DID_RE, getBlueskyProfileUrl, getProfileUrl } from './route';
import type { AtmosphereScopedProfileSummary } from '@automattic/api-core';

interface Props {
	connectionId: number;
	actor: string;
}

export function FollowersView( { connectionId, actor }: Props ) {
	const translate = useTranslate();
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

	const followersQuery = useAtmosphereActorFollowersInfiniteQuery( { connectionId, actor } );

	// Project the AtmosphereError union onto SocialError before handing the
	// query to SocialAccountList. Atmosphere has variants (auth_failed,
	// invalid_handle, etc.) that don't exist on the protocol-agnostic
	// SocialError used by SocialFeedList's empty-state vocabulary.
	const query: SocialAccountListProps< AtmosphereScopedProfileSummary >[ 'query' ] = useMemo(
		() => ( {
			data: followersQuery.data,
			isPending: followersQuery.isPending,
			isError: followersQuery.isError,
			error: projectAtmosphereError( followersQuery.error ),
			hasNextPage: followersQuery.hasNextPage,
			isFetchingNextPage: followersQuery.isFetchingNextPage,
			// SocialAccountList narrows these to `() => void` at the call site,
			// so the precise return-type generics on the upstream query don't
			// matter. Cast through `unknown` because the SocialError vs
			// AtmosphereError mismatch in the return shapes can't otherwise
			// be reconciled without leaking AtmosphereError into the shared
			// type.
			fetchNextPage:
				followersQuery.fetchNextPage as unknown as SocialAccountListProps< AtmosphereScopedProfileSummary >[ 'query' ][ 'fetchNextPage' ],
			refetch:
				followersQuery.refetch as unknown as SocialAccountListProps< AtmosphereScopedProfileSummary >[ 'query' ][ 'refetch' ],
		} ),
		[
			followersQuery.data,
			followersQuery.isPending,
			followersQuery.isError,
			followersQuery.error,
			followersQuery.hasNextPage,
			followersQuery.isFetchingNextPage,
			followersQuery.fetchNextPage,
			followersQuery.refetch,
		]
	);

	const followMutation = useMutation( followAtmosphereActorMutation( queryClient ) );
	const unfollowMutation = useMutation( unfollowAtmosphereActorMutation( queryClient ) );

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
			followState: isSelf
				? undefined
				: {
						isFollowing,
						isFollowedBy: item.viewer.followed_by,
						isPending: isPendingFollow,
						onFollow: () =>
							followMutation.mutate( {
								connectionId,
								actor: item.handle,
								subjectDid: item.did,
							} ),
						onUnfollow: () => {
							if ( ! item.viewer.following_rkey ) {
								return;
							}
							unfollowMutation.mutate( {
								connectionId,
								actor: item.handle,
								rkey: item.viewer.following_rkey,
								subjectDid: item.did,
							} );
						},
				  },
		};
	};

	const profileRef = DID_RE.test( actor ) ? { did: actor } : { handle: actor };
	const profileHref = getProfileUrl( connectionId, profileRef );

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
			/>
		</ReaderMain>
	);
}

export default FollowersView;
