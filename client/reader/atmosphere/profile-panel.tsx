import { useConnectionQuery } from '@automattic/api-queries';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import { SocialProfileCard, type SocialProfileStat } from 'calypso/reader/social';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { errorMessage } from './profile-errors';
import { getBlueskyProfileUrl } from './route';
import type { AtmosphereConnection } from '@automattic/api-core';
import type { AppState } from 'calypso/types';
import type { UnknownAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

interface ProfilePanelProps {
	connection: AtmosphereConnection;
}

export function ProfilePanel( { connection }: ProfilePanelProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
	const { data, error, isPending } = useConnectionQuery( connection.id );

	if ( isPending && ! data ) {
		return (
			<div role="status" aria-live="polite">
				{ translate( 'Loading profile…' ) }
			</div>
		);
	}

	if ( error ) {
		return (
			<EmptyContent
				title={ translate( 'Couldn’t load your profile' ) }
				line={ errorMessage( error, translate ) }
			/>
		);
	}

	if ( ! data ) {
		return null;
	}

	const stats: SocialProfileStat[] = [
		{
			key: 'followers',
			count: data.counts.followers,
			label: translate( 'follower', 'followers', { count: data.counts.followers } ),
		},
		{
			key: 'follows',
			count: data.counts.follows,
			label: translate( 'following', {
				context: 'profile stats: count of accounts followed',
			} ),
		},
		{
			key: 'posts',
			count: data.counts.posts,
			label: translate( 'post', 'posts', { count: data.counts.posts } ),
		},
	];

	const blueskyUrl = getBlueskyProfileUrl( data.handle );
	const handleViewOnBskyClick = () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_atmosphere_account_view_on_bluesky_clicked', {
				connection_id: connection.id,
			} )
		);
	};

	return (
		<SocialProfileCard
			avatar={ data.avatar }
			banner={ data.banner }
			displayName={ data.display_name ?? undefined }
			handle={ data.handle }
			bio={ data.description }
			stats={ stats }
			statsLabel={ String( translate( 'Profile stats' ) ) }
			headerActions={
				<a
					className="atmosphere-profile__view-on-bsky"
					href={ blueskyUrl }
					target="_blank"
					rel="noopener noreferrer"
					onClick={ handleViewOnBskyClick }
				>
					{ translate( 'View on Bluesky' ) }
				</a>
			}
		/>
	);
}

export default ProfilePanel;
