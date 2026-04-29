import { useAuthorFeedInfiniteQuery, useAuthorProfileQuery } from '@automattic/api-queries';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { useCallback } from 'react';
import EmptyContent from 'calypso/components/empty-content';
import {
	SocialAuthorProfilePanel,
	SocialProfileCard,
	mapAtmosphereFeedItemToSocialPost,
	type SocialProfileStat,
} from 'calypso/reader/social';
import { projectAtmosphereError } from './error-projection';
import { errorMessage } from './profile-errors';
import { getBlueskyProfileUrl, getProfileUrl, getThreadUrl, getTimelineUrl } from './route';
import type {
	AtmosphereAuthorProfile,
	AtmosphereConnection,
	AtmosphereError,
	AtmosphereFeedItem,
} from '@automattic/api-core';

interface AuthorProfilePanelProps {
	connection: AtmosphereConnection;
	actor: string;
}

export function AuthorProfilePanel( { connection, actor }: AuthorProfilePanelProps ) {
	const translate = useTranslate();

	const profile = useAuthorProfileQuery( { actor } );
	const feed = useAuthorFeedInfiniteQuery( { actor } );

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
					count: profile.data.counts.follows,
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
		( profileData: AtmosphereAuthorProfile ) => (
			<SocialProfileCard
				avatar={ profileData.avatar }
				banner={ profileData.banner }
				displayName={ profileData.display_name ?? undefined }
				handle={ profileData.handle }
				bioHtml={ profileData.description_html }
				stats={ stats }
				statsLabel={ String( translate( 'Profile stats' ) ) }
			/>
		),
		[ stats, translate ]
	);

	const renderProfileError = useCallback(
		( error: AtmosphereError, retry: () => void ) => {
			const noRetry = new Set< AtmosphereError[ 'kind' ] >( [
				'auth_required',
				'auth_failed',
				'not_found',
				'connection_not_found',
				'bad_request',
				'invalid_handle',
				'invalid_credentials',
			] );
			const showRetry = ! noRetry.has( error.kind );
			const titleByKind: Partial< Record< AtmosphereError[ 'kind' ], TranslateResult > > = {
				not_found: translate( 'Profile not found' ),
				auth_required: translate( 'Reconnect needed' ),
				rate_limited: translate( 'Slow down' ),
				upstream_unavailable: translate( 'Bluesky unreachable' ),
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

	const renderProfileLoading = useCallback( () => <ProfileHeaderSkeleton />, [] );

	const getProfileViewedProps = useCallback(
		( profileData: AtmosphereAuthorProfile ) => ( {
			actor_did: profileData.did,
			actor_handle: profileData.handle,
		} ),
		[]
	);

	const feedItemKey = useCallback( ( item: AtmosphereFeedItem ) => item.uri ?? undefined, [] );

	const buildProfileUrl = useCallback(
		( ref: { did?: string | null; handle?: string | null } ) => getProfileUrl( connection.id, ref ),
		[ connection.id ]
	);

	const buildThreadUrl = useCallback(
		( uri: string ) => getThreadUrl( connection.id, uri ),
		[ connection.id ]
	);

	const emptyHandle = profile.data?.handle ?? actor;

	return (
		<SocialAuthorProfilePanel< AtmosphereAuthorProfile, AtmosphereError, AtmosphereFeedItem >
			connectionId={ connection.id }
			actor={ actor }
			timelineUrl={ getTimelineUrl( connection.id ) }
			source="atmosphere"
			tracksProtocolPrefix="calypso_reader_atmosphere_"
			profile={ profile }
			feed={ feed }
			getProfileViewedProps={ getProfileViewedProps }
			renderProfileBody={ renderProfileBody }
			renderProfileError={ renderProfileError }
			renderProfileLoading={ renderProfileLoading }
			feedItemKey={ feedItemKey }
			mapFeedItem={ mapAtmosphereFeedItemToSocialPost }
			projectFeedError={ projectAtmosphereError }
			buildProfileUrl={ buildProfileUrl }
			buildThreadUrl={ buildThreadUrl }
			emptyTitle={ String(
				translate( '@%(handle)s hasn’t posted yet.', { args: { handle: emptyHandle } } )
			) }
			emptyLine={ String( translate( 'Their feed is empty.' ) ) }
			emptyActionLabel={ String( translate( 'View on Bluesky' ) ) }
			emptyActionURL={ profile.data?.bluesky_url ?? getBlueskyProfileUrl( actor ) }
			protocolLabel="Bluesky"
			protocolHomeURL="/reader/atmosphere"
			protocolHomeLabel={ translate( 'Back to ATmosphere' ) }
			className="atmosphere-author-profile"
		/>
	);
}

function ProfileHeaderSkeleton() {
	return (
		<div className="atmosphere-profile__header-skeleton" aria-hidden="true">
			<div className="atmosphere-profile__header-skeleton-banner" />
			<div className="atmosphere-profile__header-skeleton-avatar" />
			<div className="atmosphere-profile__header-skeleton-name" />
			<div className="atmosphere-profile__header-skeleton-handle" />
			<div className="atmosphere-profile__header-skeleton-stats" />
		</div>
	);
}
