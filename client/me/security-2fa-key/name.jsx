import { Button, FormLabel } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';

class Security2faKeyAddName extends Component {
	static propTypes = {
		onNameSubmit: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
	};

	state = {
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
						{ this.props.translate(
							'Give the security key a name. Make it up! It can be anything.'
						) }
					</FormLabel>
					<FormTextInput
						autoComplete="off"
						className="security-2fa-key__key-name"
						id="security-2fa-key__key_name"
						name="security_key_name"
						ref={ ( input ) => ( this.keyNameInput = input ) }
						placeholder={ this.props.translate( 'My Android phone' ) }
						onChange={ this.handleChange }
						value={ this.state.keyName }
					/>
				</FormFieldset>
				<FormButton
					className="security-2fa-key__register-key"
					disabled={ 0 === this.state.keyName.length }
				>
					{ this.props.translate( 'Register key' ) }
				</FormButton>
				<Button onClick={ this.props.onCancel }>{ this.props.translate( 'Cancel' ) }</Button>
			</form>
		);
	}
}

export default localize( Security2faKeyAddName );
