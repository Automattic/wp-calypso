/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';

class Security2faKeyAddName extends React.Component {
	static propTypes = {
		onNameSubmit: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
	};

	state = {
		error: false,
		keyName: '',
	};

	componentDidMount = () => {
		this.keyNameInput.focus();
	};

	submitName = ( e ) => {
		e.preventDefault();
		this.props.onNameSubmit( this.state.keyName );
	};

	handleChange = ( e ) => {
		const { value } = e.currentTarget;
		this.setState( { keyName: value } );
	};

	render() {
		return (
			<form className="security-2fa-key__add-key-name-form" onSubmit={ this.submitName }>
				<FormFieldset>
					<FormLabel htmlFor="security-2fa-key__key-name">
						{ this.props.translate( 'Give the security key a name' ) }
					</FormLabel>
					<FormTextInput
						autoComplete="off"
						className="security-2fa-key__key-name"
						id="security-2fa-key__key_name"
						name="security_key_name"
						ref={ ( input ) => ( this.keyNameInput = input ) }
						placeholder={ this.props.translate( 'ex: My FIDO Key' ) }
						onChange={ this.handleChange }
						value={ this.state.keyName }
					/>
				</FormFieldset>
				<Button onClick={ this.props.onCancel }>{ this.props.translate( 'Cancel' ) }</Button>
				<FormButton
					className="security-2fa-key__register-key"
					disabled={ 0 === this.state.keyName.length }
				>
					{ this.props.translate( 'Register key' ) }
				</FormButton>
			</form>
		);
	}
}

export default localize( Security2faKeyAddName );
