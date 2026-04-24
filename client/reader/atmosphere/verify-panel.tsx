import { Card, CardBody } from '@wordpress/components';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
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
					<div className="atmosphere-verify">
						{ data.avatar ? (
							<img
								src={ data.avatar }
								alt=""
								className="atmosphere-verify__avatar"
								onError={ ( event ) => {
									event.currentTarget.style.display = 'none';
								} }
							/>
						) : null }
						<ul className="atmosphere-verify__stats" aria-label={ translate( 'Profile stats' ) }>
							<li className="atmosphere-verify__stat">
								<span className="atmosphere-verify__stat-count">{ data.counts.followers }</span>{ ' ' }
								<span className="atmosphere-verify__stat-label">
									{ translate( 'follower', 'followers', { count: data.counts.followers } ) }
								</span>
							</li>
							<li className="atmosphere-verify__stat">
								<span className="atmosphere-verify__stat-count">{ data.counts.follows }</span>{ ' ' }
								<span className="atmosphere-verify__stat-label">
									{ translate( 'following', {
										context: 'profile stats: count of accounts followed',
									} ) }
								</span>
							</li>
							<li className="atmosphere-verify__stat">
								<span className="atmosphere-verify__stat-count">{ data.counts.posts }</span>{ ' ' }
								<span className="atmosphere-verify__stat-label">
									{ translate( 'post', 'posts', { count: data.counts.posts } ) }
								</span>
							</li>
						</ul>
						{ data.description ? (
							<p className="atmosphere-verify__bio">{ data.description }</p>
						) : null }
					</div>
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
		default:
			return translate( 'Something went wrong.' );
	}
}
