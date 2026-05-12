import {
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
	ExternalLink,
	TextControl,
} from '@wordpress/components';
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

	const appPasswordHelp = translate(
		'Use a Bluesky app password rather than your main password, so you can revoke access anytime. {{a}}How do I get an app password?{{/a}}',
		{
			components: {
				a: <ExternalLink children={ null } href="https://bsky.app/settings/app-passwords" />,
			},
		}
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
					<VStack spacing={ 4 }>
						<p>
							{ translate(
								'Once connected, your Bluesky timeline appears alongside your blog feeds. You can like, repost, reply, and post directly from the Reader, with no app switching needed.'
							) }
						</p>
						<TextControl
							label={ translate( 'Bluesky username' ) }
							value={ handle }
							onChange={ setHandle }
							placeholder="alice.bsky.social"
							help={ translate(
								'Your full handle, including the domain (for example, alice.bsky.social).'
							) }
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
							help={ appPasswordHelp }
							disabled={ isSubmitting }
							__nextHasNoMarginBottom
						/>
						{ error ? (
							<p className="atmosphere-error" role="alert">
								{ errorMessage( error, translate ) }
							</p>
						) : null }
						{ /* Wrap so the button stays intrinsic-sized inside VStack (which stretches children by default). */ }
						<div>
							<Button
								variant="primary"
								type="submit"
								disabled={ ! canSubmit }
								isBusy={ isSubmitting }
							>
								{ translate( 'Connect' ) }
							</Button>
						</div>
					</VStack>
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
		// keep the switch exhaustive without changing the user-visible
		// copy on this screen. The slice-8a `blob_decode_failed` kind is
		// set client-side from `compressImage` failures and listed here
		// for the same reason — it won't surface from the connect form.
		case 'text_too_long':
		case 'reply_disabled':
		case 'quote_disabled':
		case 'target_unavailable':
		case 'unknown':
		case 'blob_decode_failed':
			return translate( 'Something went wrong.' );
		default:
			// Defensive fallback if AtmosphereError widens before this
			// switch is updated. TypeScript exhaustiveness keeps this
			// branch unreachable today; without it, an empty-toast notice
			// would render via `errorNotice( undefined )` for a kind we
			// haven't classified yet. See `client/reader/AGENTS.md` —
			// "Add a default: arm to error-message switches."
			return translate( 'Something went wrong.' );
	}
}
