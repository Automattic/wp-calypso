import { Button, Card, CardBody, ExternalLink, TextControl } from '@wordpress/components';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { useState, type FormEvent } from 'react';
import type { MastodonError } from '@automattic/api-core';

interface ConnectFormProps {
	onSubmit: ( values: { instance: string; handle: string; access_token: string } ) => void;
	isSubmitting: boolean;
	error: MastodonError | null;
}

export function ConnectForm( { onSubmit, isSubmitting, error }: ConnectFormProps ) {
	const translate = useTranslate();
	const [ instance, setInstance ] = useState( '' );
	const [ handle, setHandle ] = useState( '' );
	const [ accessToken, setAccessToken ] = useState( '' );
	const canSubmit =
		instance.trim().length > 0 &&
		handle.trim().length > 0 &&
		accessToken.length > 0 &&
		! isSubmitting;

	const helpLink = (
		<ExternalLink href="https://docs.joinmastodon.org/client/token/">
			{ translate( 'How do I get an access token?' ) }
		</ExternalLink>
	);

	const handleSubmit = ( event: FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		if ( ! canSubmit ) {
			return;
		}
		onSubmit( {
			instance: instance.trim(),
			handle: handle.trim(),
			access_token: accessToken,
		} );
	};

	return (
		<Card>
			<CardBody>
				<form onSubmit={ handleSubmit }>
					<TextControl
						label={ translate( 'Instance' ) }
						value={ instance }
						onChange={ setInstance }
						placeholder="mastodon.social"
						disabled={ isSubmitting }
						__nextHasNoMarginBottom
					/>
					<TextControl
						label={ translate( 'Handle' ) }
						value={ handle }
						onChange={ setHandle }
						placeholder="alice"
						disabled={ isSubmitting }
						__nextHasNoMarginBottom
					/>
					<TextControl
						label={ translate( 'Access token' ) }
						type="password"
						autoComplete="new-password"
						value={ accessToken }
						onChange={ setAccessToken }
						help={ helpLink }
						disabled={ isSubmitting }
						__nextHasNoMarginBottom
					/>
					{ error ? (
						<p className="mastodon-error" role="alert">
							{ errorMessage( error, translate ) }
						</p>
					) : null }
					<Button variant="primary" type="submit" disabled={ ! canSubmit } isBusy={ isSubmitting }>
						{ translate( 'Connect' ) }
					</Button>
				</form>
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
			return translate( 'Wrong handle or access token. Double-check and try again.' );
		case 'rate_limited':
			return translate( 'The Mastodon instance is asking us to slow down. Try again in a minute.' );
		case 'upstream_unavailable':
			return translate( 'The Mastodon instance is unreachable right now.' );
		case 'connection_not_found':
			return translate( 'That connection is no longer available.' );
		default:
			return translate( 'Something went wrong.' );
	}
}
