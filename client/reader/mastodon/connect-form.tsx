import { Button, Card, CardBody, TextControl } from '@wordpress/components';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { useState, type FormEvent } from 'react';
import type { MastodonError } from '@automattic/api-core';

interface ConnectFormProps {
	onSubmit: ( values: { instance: string } ) => void;
	isSubmitting: boolean;
	error: MastodonError | null;
}

export function ConnectForm( { onSubmit, isSubmitting, error }: ConnectFormProps ) {
	const translate = useTranslate();
	const [ instance, setInstance ] = useState( '' );
	const canSubmit = instance.trim().length > 0 && ! isSubmitting;

	const handleSubmit = ( event: FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		if ( ! canSubmit ) {
			return;
		}
		onSubmit( { instance: instance.trim() } );
	};

	return (
		<Card>
			<CardBody>
				<form onSubmit={ handleSubmit }>
					<p className="mastodon-connect-form__instruction">
						{ translate( 'Enter your server’s address — we’ll hand you off to sign in there.' ) }
					</p>
					<TextControl
						label={ translate( 'Instance' ) }
						value={ instance }
						onChange={ setInstance }
						placeholder="mastodon.social"
						help={ translate(
							'The domain of the Mastodon (or compatible) server where your account lives.'
						) }
						disabled={ isSubmitting }
						__nextHasNoMarginBottom
					/>
					{ error ? (
						<p className="mastodon-error" role="alert">
							{ errorMessage( error, translate ) }
						</p>
					) : null }
					<Button variant="primary" type="submit" disabled={ ! canSubmit } isBusy={ isSubmitting }>
						{ translate( 'Continue' ) }
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
			return translate( 'We couldn’t start the authorization. Try again.' );
		case 'auth_required':
			return translate(
				'Your Mastodon connection needs to be re-authorized. Disconnect and reconnect.'
			);
		case 'rate_limited':
			return translate( 'The Mastodon instance is asking us to slow down. Try again in a minute.' );
		case 'upstream_unavailable':
			return translate( 'The Mastodon instance is unreachable right now.' );
		case 'bad_request':
			return translate( "That doesn't look like a valid instance. Check the URL and try again." );
		case 'connection_not_found':
			return translate( 'That connection is no longer available.' );
		case 'not_found':
			return translate( 'That Mastodon resource is no longer available.' );
		case 'media_too_large':
		case 'media_unsupported_type':
		case 'media_decode_failed':
		case 'media_invalid':
		case 'unknown':
			return translate( 'Something went wrong.' );
		default:
			return assertNever( error );
	}
}

function assertNever( value: never ): never {
	throw new Error( `Unhandled MastodonError kind: ${ JSON.stringify( value ) }` );
}
