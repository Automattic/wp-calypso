import { ExternalLink, FormInputValidation, FormLabel, Spinner } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FormEvent, useEffect, useId, useRef, useState } from 'react';
import FormsButton from 'calypso/components/forms/form-button';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { Connection, Service } from './types';

interface Props {
	service: Service;
	action: () => void;
	connectAnother: () => void;
	connections: Connection[];
	isConnecting: boolean;
}

/**
 * Example valid handles:
 * - domain.tld
 * - username.bsky.social
 * - user-name.bsky.social
 * - my-domain.com
 * @param {string} handle - Handle to validate
 * @returns {boolean} - Whether the handle is valid
 */
function isValidBlueskyHandle( handle: string ) {
	const parts = handle.split( '.' ).filter( Boolean );

	// A valid handle should have at least 2 parts - domain, and tld
	if ( parts.length < 2 ) {
		return false;
	}

	return parts.every( ( part ) => /^[a-z0-9_-]+$/i.test( part ) );
}

/**
 * Remove any leading "@" and trim the handle
 * @param {string} handle - Handle to cleanup
 * @returns {string} - Cleaned up handle
 */
function cleanUpHandle( handle: string ) {
	return handle.replaceAll( /@/g, '' ).trim();
}

const isAlreadyConnected = ( connections: Array< Connection >, handle: string ) => {
	return connections.some( ( { external_name } ) => external_name === handle );
};

export const Bluesky: React.FC< Props > = ( {
	service,
	action,
	connectAnother,
	connections,
	isConnecting,
} ) => {
	const translate = useTranslate();
	const [ error, setError ] = useState( '' );
	const formRef = useRef< HTMLFormElement >( null );

	// After sucessfully connecting an account, reset the handle.
	// Disabled react-hooks/exhaustive-deps because we don't want to run this on handle change
	useEffect( () => {
		const handle = formRef.current?.elements.namedItem( 'handle' ) as HTMLInputElement;

		if ( ! isConnecting && isAlreadyConnected( connections, cleanUpHandle( handle.value ) ) ) {
			formRef.current?.reset();
		}
	}, [ isConnecting, connections ] ); // eslint-disable-line react-hooks/exhaustive-deps

	/**
	 * Handle the Connect account submission.
	 */
	const handleSubmit = ( e: FormEvent< HTMLFormElement > ) => {
		e.preventDefault();
		e.stopPropagation();
		setError( '' );

		const formData = new FormData( e.target as HTMLFormElement );

		// Let us make the user's life easier by removing the leading "@" if they added it
		const handle = cleanUpHandle( formData.get( 'handle' )?.toString().trim() || '' );
		const app_password = formData.get( 'app_password' )?.toString().trim() || '';

		if ( isAlreadyConnected( connections, handle ) ) {
			return setError( translate( 'This account is already connected.' ) );
		}

		if ( ! handle || ! isValidBlueskyHandle( handle ) ) {
			return setError( translate( 'Please enter a valid handle.' ) );
		}

		const url = new URL( service.connect_URL );
		url.searchParams.set( 'handle', handle );
		url.searchParams.set( 'app_password', app_password );

		// TODO: Fix this to avoid mutating props
		service.connect_URL = url.toString();

		connections.length >= 1 ? connectAnother() : action();
	};

	const id = useId();

	const showError = !! error;
	return (
		<div className="sharing-service-distributed-example">
			<form onSubmit={ handleSubmit } ref={ formRef }>
				<div>
					<FormLabel htmlFor={ `${ id }-handle` }>
						{ translate( 'Handle', { comment: 'Bluesky account handle' } ) }
					</FormLabel>
					<FormSettingExplanation>
						{ translate( 'You can find the handle in your Bluesky profile.' ) }
					</FormSettingExplanation>
					<input
						autoComplete="off"
						autoCapitalize="off"
						autoCorrect="off"
						spellCheck="false"
						id={ `${ id }-handle` }
						name="handle"
						placeholder="username.bsky.social"
						required
						type="text"
						className="form-text-input"
					/>
					{ showError && <FormInputValidation isError text={ error } /> }
				</div>
				<div>
					<FormLabel htmlFor={ `${ id }-app-password` }>{ translate( 'App password' ) }</FormLabel>
					<FormSettingExplanation>
						{ translate(
							'App password is needed to safely connect your account. App password is different from your account password. You can {{link}}generate it in Bluesky{{/link}}.',
							{
								components: {
									link: <ExternalLink href="https://bsky.app/settings/app-passwords" />,
								},
							}
						) }
					</FormSettingExplanation>
					<input
						autoComplete="off"
						autoCapitalize="off"
						autoCorrect="off"
						spellCheck="false"
						id={ `${ id }-app-password` }
						name="app_password"
						type="password"
						placeholder="xxxx-xxxx-xxxx-xxxx"
						required
						className="form-text-input"
					/>
					{ showError && <FormInputValidation isError text={ error } /> }
				</div>
				<div>
					<FormsButton primary type="submit" disabled={ isConnecting }>
						{ translate( 'Connect account' ) }
						{ isConnecting && <Spinner /> }
					</FormsButton>
				</div>
			</form>
		</div>
	);
};

export default Bluesky;
