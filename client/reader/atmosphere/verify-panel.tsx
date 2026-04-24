import { Card, CardBody } from '@wordpress/components';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { SocialProfileCard, type SocialProfileStat } from 'calypso/reader/social';
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
						{ errorMessage( error, translate ) }
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

function errorMessage(
	error: AtmosphereError,
	translate: ReturnType< typeof useTranslate >
): TranslateResult {
	switch ( error.kind ) {
		case 'auth_failed':
			return translate(
				'Your Bluesky connection needs to be re-authorized. Disconnect and reconnect.'
			);
		case 'rate_limited':
			return translate( "Bluesky's asking us to slow down. Try again in a minute." );
		case 'upstream_unavailable':
			return translate( 'Bluesky is unreachable right now.' );
		case 'connection_not_found':
			return translate( 'That connection is no longer available.' );
		case 'invalid_handle':
		case 'invalid_credentials':
		case 'bad_request':
		case 'unknown':
			return translate( 'Something went wrong.' );
		default:
			return assertNever( error );
	}
}

function assertNever( value: never ): never {
	throw new Error( `Unhandled AtmosphereError kind: ${ JSON.stringify( value ) }` );
}
