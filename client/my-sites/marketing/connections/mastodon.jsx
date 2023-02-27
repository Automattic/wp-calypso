import { FormInputValidation } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useState, FormEvent } from 'react';
import FormsButton from 'calypso/components/forms/form-button';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';

const Mastodon = ( { service, action, connectAnother, connections } ) => {
	const translate = useTranslate();
	const [ instance, setInstance ] = useState( '' );
	const [ error, setError ] = useState( null );

	/**
	 * Checks if username matches a valid Mastodon username.
	 *
	 * @param {string} username
	 * @returns boolean
	 */
	const isValidUsername = ( username ) =>
		/@?\b([A-Z0-9_]+)@([A-Z0-9.-]+\.[A-Z]{2,})\b/gi.test( username );

	const validateInstance = () => {
		if ( ! instance || isValidUsername( instance ) ) {
			setError( null );
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
		service.connect_URL = url.toString();
	};

	/**
	 * Handle the Connect account submission.
	 *
	 * @param {FormEvent< HTMLFormElement >} e - The form submission event.
	 */
	const handleSubmit = ( e ) => {
		e.preventDefault();
		setInstanceToConnectURL();
		connections.length >= 1 ? connectAnother() : action();
	};

	const showError = !! error;
	return (
		<div className="sharing-service-distributed-example">
			<form onSubmit={ handleSubmit }>
				<div className="sharing-service-example">
					<FormLabel htmlFor="instance">{ translate( 'Enter your Mastodon username' ) }</FormLabel>
					<FormTextInput
						autoCapitalize="off"
						autoCorrect="off"
						spellCheck="false"
						id="instance"
						name="instance"
						value={ instance }
						isError={ showError }
						onBlur={ validateInstance }
						onChange={ ( event ) => setInstance( event.target.value.trim() ) }
					/>
					{ showError && <FormInputValidation isError text={ error } /> }
				</div>
				<div className="sharing-service-example">
					<FormsButton
						primary
						type="submit"
						disabled={ ! isValidUsername( instance ) || showError }
					>
						{ connections.length >= 1
							? translate( 'Connect one more account' )
							: translate( 'Connect account' ) }
					</FormsButton>
				</div>
			</form>
		</div>
	);
};

Mastodon.propTypes = {
	service: PropTypes.object.isRequired,
	action: PropTypes.func.isRequired,
	connectAnother: PropTypes.func.isRequired,
	connections: PropTypes.array.isRequired,
};

export default Mastodon;
