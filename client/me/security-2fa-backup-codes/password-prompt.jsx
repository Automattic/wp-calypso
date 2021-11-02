import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';

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

	handleSubmit = ( e ) => {
		e.preventDefault();
		this.props.onSubmit( this.state.userPassword );
	};

	handleChange = ( e ) => {
		const { value } = e.currentTarget;
		this.setState( { userPassword: value } );
	};

	render() {
		return (
			<form onSubmit={ this.handleSubmit }>
				<FormFieldset>
					<FormLabel htmlFor="user_password">{ this.props.translate( 'Password' ) }</FormLabel>
					<FormTextInput
						autoComplete="off"
						id="user_password"
						name="user_password"
						type="password"
						ref={ ( input ) => ( this.passwordInput = input ) }
						value={ this.state.userPassword }
						placeholder={ this.props.translate( 'Your WordPress.com password' ) }
						onChange={ this.handleChange }
					/>
					<FormSettingExplanation>
						{ this.props.translate(
							'Your WordPress.com password is required to generate new backup codes.'
						) }
					</FormSettingExplanation>
				</FormFieldset>
				<FormButton disabled={ 0 === this.state.userPassword.length }>
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
