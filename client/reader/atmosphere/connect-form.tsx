import { Button, Card, CardBody, ExternalLink, TextControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, type FormEvent } from 'react';
import { atmosphereErrorMessage } from './error-messages';
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
							{ atmosphereErrorMessage( error, translate ) }
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
