import { useConnectionQuery } from '@automattic/api-queries';
import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import { SocialProfileCard, type SocialProfileStat } from 'calypso/reader/social';
import { errorMessage } from './profile-errors';
import type { AtmosphereConnection } from '@automattic/api-core';

interface ProfilePanelProps {
	connection: AtmosphereConnection;
}

export function ProfilePanel( { connection }: ProfilePanelProps ) {
	const translate = useTranslate();
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

	return (
		<SocialProfileCard
			avatar={ data.avatar }
			banner={ data.banner }
			displayName={ data.display_name ?? undefined }
			handle={ data.handle }
			bio={ data.description }
			stats={ stats }
			statsLabel={ String( translate( 'Profile stats' ) ) }
		/>
	);
}

export default ProfilePanel;
