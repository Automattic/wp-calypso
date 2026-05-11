import {
	useFediverseAuthorFeedInfiniteQuery,
	useFediverseAuthorProfileQuery,
} from '@automattic/api-queries';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import EmptyContent from 'calypso/components/empty-content';
import {
	SocialAuthorProfilePanel,
	SocialProfileCard,
	mapFediverseAuthorProfileToSocialProfileCardProps,
	mapFediverseFeedItemToSocialPost,
	stripLeadingAt,
	type SocialProfileStat,
} from 'calypso/reader/social';
import { projectFediverseError } from './error-projection';
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

	const profile = useFediverseAuthorProfileQuery( connection.id, actor );
	const feed = useFediverseAuthorFeedInfiniteQuery( connection.id, actor );

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
			return (
				<SocialProfileCard
					{ ...cardProps }
					stats={ stats }
					statsLabel={ String( translate( 'Profile stats' ) ) }
				/>
			);
		},
		[ host, stats, translate ]
	);

	const renderProfileError = useCallback(
		( error: FediverseError, retry: () => void ) => {
			const noRetry = new Set< FediverseError[ 'kind' ] >( [
				'auth_required',
				'not_found',
				'connection_not_found',
			] );
			const showRetry = ! noRetry.has( error.kind );
			const titleByKind: Partial< Record< FediverseError[ 'kind' ], TranslateResult > > = {
				not_found: translate( 'Profile not found' ),
				auth_required: translate( 'Reconnect needed' ),
				rate_limited: translate( 'Slow down' ),
				upstream_unavailable: translate( 'Fediverse unreachable' ),
			};
			return (
				<EmptyContent
					title={ titleByKind[ error.kind ] ?? translate( 'Couldn’t load profile' ) }
					line={ translate( 'Try again in a moment.' ) }
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
			className="fediverse-author-profile"
		/>
	);
}
