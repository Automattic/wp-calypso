import { FormInputValidation, FormLabel } from '@automattic/components';
import emailValidator from 'email-validator';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import Buttons from './buttons';

class SecurityAccountRecoveryRecoveryEmailEdit extends Component {
	static displayName = 'SecurityAccountRecoveryRecoveryEmailEdit';

	static propTypes = {
		storedEmail: PropTypes.string,
		onSave: PropTypes.func,
		onDelete: PropTypes.func,
	};

	static defaultProps = {
		storedEmail: null,
	};

	state = {
		email: this.props.storedEmail || null,
	};

	renderValidation = () => {
		let validation = null;
		if ( this.state.validation ) {
			validation = <FormInputValidation isError text={ this.state.validation } />;
		}
		return validation;
	};

	renderExplanation = () => {
		let explanation = null;
		let text;

		if ( this.props.primaryEmail ) {
			text = this.props.translate( 'Your primary email address is {{email/}}', {
				components: {
					email: <strong>{ this.props.primaryEmail }</strong>,
				},
			} );

			explanation = <FormSettingExplanation>{ text }</FormSettingExplanation>;
		}
		return explanation;
	};

	render() {
		return (
			<div className={ this.props.className }>
				<FormFieldset>
					<FormLabel htmlFor="email">{ this.props.translate( 'Email address' ) }</FormLabel>
					<FormTextInput
						isError={ this.state.isInvalid }
						onKeyUp={ this.onKeyUp }
						id="email"
						name="email"
						ref={ this.emailInputRef }
						value={ this.state.email }
						onChange={ this.handleChange }
					/>
					{ this.renderValidation() }
					{ this.renderExplanation() }
				</FormFieldset>

				<Buttons
					isSavable={ this.isSavable() }
					isDeletable={ !! this.props.storedEmail }
					saveText={ this.props.translate( 'Save Email' ) }
					onSave={ this.onSave }
					onDelete={ this.onDelete }
				/>
			</div>
		);
	}

	isSavable = () => {
		if ( ! this.state.email ) {
			return false;
		}

		if ( this.state.email === this.props.storedEmail ) {
			return false;
		}

		return true;
	};

	onKeyUp = ( event ) => {
		if ( event.key === 'Enter' ) {
			this.onSave();
		}
	};

	onSave = () => {
		const email = this.state.email;

		if ( ! this.isSavable() ) {
			return;
		}

		const isEmailValid = this.validateEmail( email );
		if ( ! isEmailValid ) {
			return;
		}

		this.props.onSave( email );
	};

	onDelete = () => {
		this.props.onDelete();
	};

	validateEmail = ( newEmail ) => {
		const { primaryEmail, translate } = this.props;

		if ( primaryEmail && newEmail === primaryEmail ) {
			this.setState( {
				validation: translate(
					'You have entered your primary email address. Please enter a different email address.'
				),
			} );
			return false;
		}

		if ( ! emailValidator.validate( newEmail ) ) {
			this.setState( {
				validation: translate( 'Please enter a valid email address.' ),
			} );
			return false;
		}

		this.setState( { validation: null } );

		return true;
	};

	handleChange = ( e ) => {
		const { name, value } = e.currentTarget;

		if ( 'email' === name ) {
			this.validateEmail( value );
		}

		this.setState( { [ name ]: value } );
	};
}

export default localize( SecurityAccountRecoveryRecoveryEmailEdit );
