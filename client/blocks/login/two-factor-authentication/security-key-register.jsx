import { Card, FormInputValidation, FormLabel } from '@automattic/components';
import { Button } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { isWebAuthnSupported, registerSecurityKey } from 'calypso/lib/webauthn';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';

import './security-key-register.scss';

class SecurityKeyRegister extends Component {
	static propTypes = {
		onFinish: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	state = {
		keyName: '',
		isRegistering: false,
		error: null,
	};

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_login_security_key_register_prompt_show' );
	}

	handleNameChange = ( event ) => {
		this.setState( { keyName: event.target.value } );
	};

	handleRegister = ( event ) => {
		event.preventDefault();
		this.props.recordTracksEvent( 'calypso_login_security_key_register_click' );
		this.setState( { isRegistering: true, error: null } );

		registerSecurityKey( this.state.keyName.trim() || null )
			.then( () => {
				this.props.recordTracksEvent( 'calypso_login_security_key_register_success' );
				this.props.onFinish();
			} )
			.catch( ( error ) => {
				this.props.recordTracksEvent( 'calypso_login_security_key_register_failure' );
				this.setState( {
					isRegistering: false,
					error:
						error?.message ?? this.props.translate( 'Something went wrong. Please try again.' ),
				} );
			} );
	};

	render() {
		const { translate } = this.props;
		const { keyName, isRegistering, error } = this.state;

		if ( ! isWebAuthnSupported() ) {
			return null;
		}

		return (
			<form onSubmit={ this.handleRegister }>
				<Card className="two-factor-authentication__security-key-register">
					<p className="security-key-register__text">
						{ translate(
							'Due to a small setup issue, some of your security keys were linked to the wrong WordPress.com domain. This isn’t a security concern — your account and data are safe.'
						) }
					</p>
					<p className="security-key-register__text">
						{ translate( 'Register a new key now so you can keep using it to log in.' ) }
					</p>

					<FormFieldset>
						<FormLabel htmlFor="security-key-name">
							{ translate( 'Give the key a name to help you remember it' ) }
						</FormLabel>
						<FormTextInput
							id="security-key-name"
							autoFocus // eslint-disable-line jsx-a11y/no-autofocus
							disabled={ isRegistering }
							value={ keyName }
							onChange={ this.handleNameChange }
							placeholder={ translate( 'e.g. My phone, My laptop' ) }
						/>
						{ error && <FormInputValidation isError text={ error } /> }
					</FormFieldset>

					<Button
						type="submit"
						variant="primary"
						busy={ isRegistering }
						disabled={ isRegistering }
						__next40pxDefaultSize
					>
						{ translate( 'Register security key' ) }
					</Button>
				</Card>
			</form>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( SecurityKeyRegister ) );
