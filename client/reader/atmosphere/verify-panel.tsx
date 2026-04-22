import { Card, CardBody } from '@wordpress/components';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import type { AtmosphereError, AtmosphereVerifyResult } from '@automattic/api-core';

interface VerifyPanelProps {
	data: AtmosphereVerifyResult | null;
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
								className="atmosphere-avatar"
								onError={ ( event ) => {
									event.currentTarget.style.display = 'none';
								} }
							/>
						) : null }
						<h2>{ data.display_name || data.handle }</h2>
						<div className="atmosphere-verify__handle">@{ data.handle }</div>
						<p>{ data.description }</p>
						<ul className="atmosphere-verify__counts">
							<li>
								{ translate( '%(count)d follower', '%(count)d followers', {
									count: data.counts.followers,
									args: { count: data.counts.followers },
								} ) }
							</li>
							<li>
								{ translate( 'Following %(count)d account', 'Following %(count)d accounts', {
									count: data.counts.follows,
									args: { count: data.counts.follows },
								} ) }
							</li>
							<li>
								{ translate( '%(count)d post', '%(count)d posts', {
									count: data.counts.posts,
									args: { count: data.counts.posts },
								} ) }
							</li>
						</ul>
						<details>
							<summary>{ translate( 'Raw getProfile response' ) }</summary>
							<pre>{ JSON.stringify( data.raw, null, 2 ) }</pre>
						</details>
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
