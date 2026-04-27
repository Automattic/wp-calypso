import { Card, CardBody } from '@wordpress/components';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { SocialProfileCard, type SocialProfileStat } from 'calypso/reader/social';
import type { MastodonConnectionDetails, MastodonError } from '@automattic/api-core';

interface VerifyPanelProps {
	data: MastodonConnectionDetails | null;
	error: MastodonError | null;
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
					count: data.counts.following,
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
					<p className="mastodon-error" role="alert">
						{ errorMessage( error, translate ) }
					</p>
				) : null }
				{ data ? (
					<SocialProfileCard
						avatar={ data.avatar }
						bioHtml={ data.description }
						stats={ stats }
						statsLabel={ String( translate( 'Profile stats' ) ) }
					/>
				) : null }
			</CardBody>
		</Card>
	);
}

function errorMessage(
	error: MastodonError,
	translate: ReturnType< typeof useTranslate >
): TranslateResult {
	switch ( error.kind ) {
		case 'invalid_instance':
			return translate( "We couldn't reach that Mastodon instance. Check the URL and try again." );
		case 'auth_failed':
			return translate(
				'Your Mastodon connection needs to be re-authorized. Disconnect and reconnect.'
			);
		case 'rate_limited':
			return translate( 'The Mastodon instance is asking us to slow down. Try again in a minute.' );
		case 'upstream_unavailable':
			return translate( 'The Mastodon instance is unreachable right now.' );
		case 'connection_not_found':
			return translate( 'That connection is no longer available.' );
		case 'bad_request':
		case 'unknown':
			return translate( 'Something went wrong.' );
		default:
			return assertNever( error );
	}
}

function assertNever( value: never ): never {
	throw new Error( `Unhandled MastodonError kind: ${ JSON.stringify( value ) }` );
}
