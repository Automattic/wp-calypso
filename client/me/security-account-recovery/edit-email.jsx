/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import ReactDom from 'react-dom';
import React from 'react';
import emailValidator from 'email-validator';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import FormInputValidation from 'components/forms/form-input-validation';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import Buttons from './buttons';

class SecurityAccountRecoveryRecoveryEmailEdit extends React.Component {
	static displayName = 'SecurityAccountRecoveryRecoveryEmailEdit';

	static propTypes = {
		storedEmail: PropTypes.string,
		onSave: PropTypes.func,
		onCancel: PropTypes.func,
		onDelete: PropTypes.func,
	};

	static defaultProps = {
		storedEmail: null,
	};

	state = {
		email: this.props.storedEmail || null,
	};

	componentDidMount() {
		this.focusInput();
	}

	renderValidation = () => {
		let validation = null;
		if ( this.state.validation ) {
			validation = <FormInputValidation isError text={ this.state.validation } />;
		}
		return validation;
	};

	renderExplanation = () => {
		let explanation = null,
			text;

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
					<FormTextInput
						isError={ this.state.isInvalid }
						onKeyUp={ this.onKeyUp }
						name="email"
						ref="email"
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
					onCancel={ this.onCancel }
				/>
			</div>
		);
	}

	focusInput = () => {
		ReactDom.findDOMNode( this.refs.email ).focus();
	};

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

		if ( this.props.primaryEmail && email === this.props.primaryEmail ) {
			this.setState( {
				validation: this.props.translate(
					'You have entered your primary email address. Please enter a different email address.'
				),
			} );
			return;
		}

		if ( ! emailValidator.validate( email ) ) {
			this.setState( {
				validation: this.props.translate( 'Please enter a valid email address.' ),
			} );
			return;
		}

		this.setState( { validation: null } );
		this.props.onSave( email );
	};

	onCancel = () => {
		this.props.onCancel();
	};

	onDelete = () => {
		this.props.onDelete();
	};

	handleChange = ( e ) => {
		const { name, value } = e.currentTarget;
		this.setState( { [ name ]: value } );
	};
}

export default localize( SecurityAccountRecoveryRecoveryEmailEdit );
