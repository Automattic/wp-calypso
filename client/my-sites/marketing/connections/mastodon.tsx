import { FormInputValidation, FormLabel, Spinner } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import FormsButton from 'calypso/components/forms/form-button';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { Connection, Service } from './types';

interface Props {
	service: Service;
	action: () => void;
	connectAnother: () => void;
	connections: Connection[];
	isConnecting: boolean;
}

const InstanceContainer = styled.div( {
	alignItems: 'center',
	display: 'flex',
	gap: '10px',
} );

/**
 * Checks if username matches a valid Mastodon username.
 */
export const isValidUsername = ( username: string ) =>
	/@?\b([A-Z0-9_]+)@([A-Z0-9.-]+\.[A-Z]{2,})\b/gi.test( username );

const isAlreadyConnected = ( connections: Connection[], instance: string ) => {
	return connections.some( ( connection ) => {
		const { external_display } = connection;
		return external_display === instance;
	} );
};

export const Mastodon: React.FC< Props > = ( {
	service,
	action,
	connectAnother,
	connections,
	isConnecting,
} ) => {
	const translate = useTranslate();
	const [ instance, setInstance ] = useState( '' );
	const [ error, setError ] = useState( '' );

	// After sucessfully connecting an account, reset the instance.
	// Disabled react-hooks/exhaustive-deps because we don't want to run this on instance change
	useEffect( () => {
		if ( ! isConnecting && isAlreadyConnected( connections, instance ) ) {
			setInstance( '' );
		}
	}, [ isConnecting, connections ] ); // eslint-disable-line react-hooks/exhaustive-deps

	const handleInstanceChange = ( e: ChangeEvent< HTMLInputElement > ) => {
		const instance = e.target.value.trim();
		setInstance( instance );

		if ( isAlreadyConnected( connections, instance ) ) {
			setError( translate( 'This account is already connected.' ) );
		} else if ( isValidUsername( instance ) || ! instance ) {
			setError( '' );
		} else {
			setError( translate( 'This username is not valid.' ) );
		}
	};

	/**
	 * Set the instance to the connect URL so that it can be used to connect to Mastodon.
	 */
	const setInstanceToConnectURL = () => {
		const url = new URL( service.connect_URL );
		url.searchParams.set( 'instance', instance );
		// TODO: Fix this to avoid mutating props
		service.connect_URL = url.toString();
	};

	/**
	 * Handle the Connect account submission.
	 */
	const handleSubmit = ( e: FormEvent< HTMLFormElement > ) => {
		e.preventDefault();
		setInstanceToConnectURL();
		connections.length >= 1 ? connectAnother() : action();
	};

	const showError = !! error;
	return (
		<div className="sharing-service-distributed-example">
			<form onSubmit={ handleSubmit }>
				<div>
					<FormLabel htmlFor="instance">{ translate( 'Enter your Mastodon username' ) }</FormLabel>
					<InstanceContainer>
						<FormTextInput
							autoCapitalize="off"
							autoCorrect="off"
							spellCheck="false"
							id="instance"
							name="instance"
							value={ instance }
							isError={ showError }
							onChange={ handleInstanceChange }
							placeholder="@mastodon@mastodon.social"
						/>
					</InstanceContainer>
					{ showError && <FormInputValidation isError text={ error } /> }
				</div>
				<div>
					<FormsButton
						primary
						type="submit"
						disabled={ ! isValidUsername( instance ) || showError || isConnecting }
					>
						{ translate( 'Connect account' ) }
						{ isConnecting && <Spinner /> }
					</FormsButton>
				</div>
			</form>
		</div>
	);
};

export default Mastodon;
