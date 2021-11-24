import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';

class Security2faBackupCodesPasswordPrompt extends Component {
	static propTypes = {
		onCancel: PropTypes.func.isRequired,
		onSubmit: PropTypes.func.isRequired,
	};

	state = {
		error: false,
		userPassword: '',
	};

	handleSubmit = ( e ) => {
		e.preventDefault();
		this.props.onSubmit( this.state.userPassword );
		this.setState( { userPassword: '' } );
	};

	handleChange = ( e ) => {
		const { value } = e.currentTarget;
		this.setState( { userPassword: value } );
	};

	render() {
		return (
			<form onSubmit={ this.handleSubmit }>
				<FormFieldset>
					<FormLabel htmlFor="password">{ this.props.translate( 'Password' ) }</FormLabel>
					<FormTextInput
						autoComplete="off"
						id="password"
						name="password"
						type="password"
						// eslint-disable-next-line jsx-a11y/no-autofocus
						autoFocus
						value={ this.state.userPassword }
						placeholder={ this.props.translate( 'WordPress.com Password' ) }
						onChange={ this.handleChange }
					/>
					<FormSettingExplanation>
						{ this.props.translate(
							'Your WordPress.com password is required to generate new backup codes.'
						) }
					</FormSettingExplanation>
				</FormFieldset>
				<FormButton disabled={ ! this.state.userPassword.length || this.props.isDisabled }>
					{ this.props.translate( 'Generate Backup Codes' ) }
				</FormButton>
				<FormButton type="button" onClick={ this.props.onCancel } isPrimary={ false }>
					{ this.props.translate( 'Cancel' ) }
				</FormButton>
			</form>
		);
	}
}

export default localize( Security2faBackupCodesPasswordPrompt );
