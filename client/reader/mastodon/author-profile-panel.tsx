import {
	useMastodonAuthorFeedInfiniteQuery,
	useMastodonAuthorProfileQuery,
} from '@automattic/api-queries';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { useCallback } from 'react';
import EmptyContent from 'calypso/components/empty-content';
import {
	SocialAuthorProfilePanel,
	SocialProfileCard,
	mapMastodonAccountToSocialProfileCardProps,
	mapMastodonFeedItemToSocialPost,
	type SocialProfileStat,
} from 'calypso/reader/social';
import { MastodonAuthorProfileTabs, useMastodonAuthorFeedFilter } from './author-profile-tabs';
import { projectMastodonError } from './error-projection';
import { errorMessage } from './profile-errors';
import { getProfileUrl, getThreadUrl, getTimelineUrl } from './route';
import type {
	MastodonAuthorProfile,
	MastodonConnection,
	MastodonError,
	MastodonFeedItem,
} from '@automattic/api-core';

interface MastodonAuthorProfilePanelProps {
	connection: MastodonConnection;
	actor: string;
}

export function MastodonAuthorProfilePanel( {
	connection,
	actor,
}: MastodonAuthorProfilePanelProps ) {
	const translate = useTranslate();

	const filter = useMastodonAuthorFeedFilter();

	const profile = useMastodonAuthorProfileQuery( connection.id, actor );
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

	const renderProfileBody = useCallback(
		( profileData: MastodonAuthorProfile ) => {
			const cardProps = mapMastodonAccountToSocialProfileCardProps( profileData, {
				instance: connection.instance,
			} );
			return (
				<>
					<SocialProfileCard
						{ ...cardProps }
						stats={ stats }
						statsLabel={ String( translate( 'Profile stats' ) ) }
					/>
					<MastodonAuthorProfileTabs
						connectionId={ connection.id }
						actor={ actor }
						activeFilter={ filter }
					/>
				</>
			);
		},
		[ connection.id, connection.instance, actor, filter, stats, translate ]
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

	return (
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
					? String( translate( 'You need to follow this account on Mastodon to see their posts.' ) )
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
	);
}
