/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormPasswordInput from 'components/forms/form-password-input';

class Security2faBackupCodesPasswordPromt extends React.Component {
	static propTypes = {
		onSubmit: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
	};

	state = {
		error: false,
		userPassword: '',
	};

	componentDidMount = () => {
		this.passwordInput.focus();
	};

	handleSubmit = e => {
		e.preventDefault();
		this.props.onSubmit( this.state.userPassword );
	};

	handleChange = e => {
		const { value } = e.currentTarget;
		this.setState( { userPassword: value } );
	};

	render() {
		return (
			<form className="security-2fa-key__add-key-name-form" onSubmit={ this.handleSubmit }>
				<FormFieldset>
					<FormLabel htmlFor="user_password">{ this.props.translate( 'Password' ) }</FormLabel>
					<FormPasswordInput
						autoCapitalize="off"
						autoCorrect="off"
						spellCheck="false"
						label={ this.props.translate( 'Password' ) }
						name="user_password"
						type="password"
						ref={ input => ( this.passwordInput = input ) }
						value={ this.state.userPassword }
						placeholder={ this.props.translate( 'Your WordPress.com Password' ) }
						onChange={ this.handleChange }
					/>
				</FormFieldset>
				<FormButton
					className="security-2fa-key__register-key"
					disabled={ 0 === this.state.userPassword.length }
				>
					{ this.props.translate( 'Generate Backup Codes' ) }
				</FormButton>
				<FormButton onClick={ this.props.onCancel } isPrimary={ false }>
					{ this.props.translate( 'Cancel' ) }
				</FormButton>
			</form>
		);
	}
}

export default localize( Security2faBackupCodesPasswordPromt );
