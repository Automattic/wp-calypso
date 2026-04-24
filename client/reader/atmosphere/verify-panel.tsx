import { Card, CardBody } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { SocialProfileCard, type SocialProfileStat } from 'calypso/reader/social';
import { atmosphereErrorMessage } from './error-messages';
import type { AtmosphereConnectionDetails, AtmosphereError } from '@automattic/api-core';

interface VerifyPanelProps {
	data: AtmosphereConnectionDetails | null;
	error: AtmosphereError | null;
	isLoading: boolean;
}

export function VerifyPanel( { data, error, isLoading }: VerifyPanelProps ) {
	const translate = useTranslate();

	if ( ! data && ! error && ! isLoading ) {
		return null;
	}

	const stats: SocialProfileStat[] = data
		? [
				{
					key: 'followers',
					count: data.counts.followers,
					label: translate( 'follower', 'followers', { count: data.counts.followers } ),
				},
				{
					key: 'following',
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
		  ]
		: [];

	return (
		<Card>
			<CardBody>
				{ isLoading && ! data ? <p>{ translate( 'Verifying…' ) }</p> : null }
				{ error ? (
					<p className="atmosphere-error" role="alert">
						{ atmosphereErrorMessage( error, translate ) }
					</p>
				) : null }
				{ data ? (
					<SocialProfileCard
						avatar={ data.avatar }
						bio={ data.description }
						stats={ stats }
						statsLabel={ String( translate( 'Profile stats' ) ) }
					/>
				) : null }
			</CardBody>
		</Card>
	);
}
