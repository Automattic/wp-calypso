import { Button, Card, CardBody, TextControl } from '@wordpress/components';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { useState } from 'react';
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
		<a href="https://bsky.app/settings/app-passwords" target="_blank" rel="noopener noreferrer">
			{ translate( 'How do I get an app password?' ) }
		</a>
	);

	return (
		<Card>
			<CardBody>
				<h2>{ translate( 'Connect a Bluesky account' ) }</h2>
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
				<Button
					variant="primary"
					disabled={ ! canSubmit }
					isBusy={ isSubmitting }
					onClick={ () => onSubmit( { handle: handle.trim(), app_password: appPassword } ) }
				>
					{ translate( 'Connect' ) }
				</Button>
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
		case 'bad_request':
			return error.message || translate( 'Something went wrong.' );
		default:
			return translate( 'Something went wrong.' );
	}
}
