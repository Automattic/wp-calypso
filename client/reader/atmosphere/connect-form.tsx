import { Button, Card, CardBody, ExternalLink, TextControl } from '@wordpress/components';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { useState, type FormEvent } from 'react';
import type { AtmosphereError } from '@automattic/api-core';

interface ConnectFormProps {
	onSubmit: ( values: { handle: string; app_password: string } ) => void;
	isSubmitting: boolean;
	error: AtmosphereError | null;
}

export function ConnectForm( { onSubmit, isSubmitting, error }: ConnectFormProps ) {
	const translate = useTranslate();
	const [ handle, setHandle ] = useState( '' );
	const [ appPassword, setAppPassword ] = useState( '' );
	const canSubmit = handle.trim().length > 0 && appPassword.length > 0 && ! isSubmitting;

	const helpLink = (
		<ExternalLink href="https://bsky.app/settings/app-passwords">
			{ translate( 'How do I get an app password?' ) }
		</ExternalLink>
	);

	const handleSubmit = ( event: FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		if ( ! canSubmit ) {
			return;
		}
		onSubmit( { handle: handle.trim(), app_password: appPassword } );
	};

	return (
		<Card>
			<CardBody>
				<form onSubmit={ handleSubmit }>
					<TextControl
						label={ translate( 'Handle' ) }
						value={ handle }
						onChange={ setHandle }
						placeholder="alice.bsky.social"
						disabled={ isSubmitting }
						__nextHasNoMarginBottom
					/>
					<TextControl
						label={ translate( 'App password' ) }
						type="password"
						autoComplete="new-password"
						value={ appPassword }
						onChange={ setAppPassword }
						placeholder="xxxx-xxxx-xxxx-xxxx"
						help={ helpLink }
						disabled={ isSubmitting }
						__nextHasNoMarginBottom
					/>
					{ error ? (
						<p className="atmosphere-error" role="alert">
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
	error: AtmosphereError,
	translate: ReturnType< typeof useTranslate >
): TranslateResult {
	switch ( error.kind ) {
		case 'invalid_handle':
			return translate( "That doesn't look like a valid Bluesky handle." );
		case 'invalid_credentials':
			return translate( 'Wrong handle or app password. Double-check and try again.' );
		case 'rate_limited':
			return translate( "Bluesky's asking us to slow down. Try again in a minute." );
		case 'upstream_unavailable':
			return translate( 'Bluesky is unreachable right now.' );
		case 'auth_failed':
		case 'auth_required':
		case 'connection_not_found':
		case 'not_found':
		case 'bad_request':
		// The slice 7c POST /posts wire codes shouldn't surface from the
		// connect form (it doesn't post), but the AtmosphereError union
		// covers the whole atmosphere surface, so list them explicitly to
		// keep `assertNever` exhaustive without changing the user-visible
		// copy on this screen.
		case 'text_too_long':
		case 'reply_disabled':
		case 'quote_disabled':
		case 'target_unavailable':
		case 'unknown':
			return translate( 'Something went wrong.' );
		default:
			return assertNever( error );
	}
}

function assertNever( value: never ): never {
	throw new Error( `Unhandled AtmosphereError kind: ${ JSON.stringify( value ) }` );
}
