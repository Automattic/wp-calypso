/** @format */
/**
 * External dependencies
 */
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import createReactClass from 'create-react-class';

/**
 * Internal dependencies
 */
import EmailForwardingLimit from './email-forwarding-limit';
import { validateAllFields } from 'lib/domains/email-forwarding';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormFooter from 'my-sites/domains/domain-management/components/form-footer';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import FormInputValidation from 'components/forms/form-input-validation';
import formState from 'lib/form-state';
import analyticsMixin from 'lib/mixins/analytics';
import { addEmailForward } from 'state/email-forwarding/actions';

// eslint-disable-next-line react/prefer-es6-class
const EmailForwardingAddNew = createReactClass( {
	displayName: 'EmailForwardingAddNew',

	propTypes: {
		initialShowForm: PropTypes.bool,
		addEmailForward: PropTypes.func.isRequired,
		emailForwards: PropTypes.array,
		emailForwardingLimit: PropTypes.number.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
	},

	mixins: [ analyticsMixin( 'domainManagement', 'emailForwarding' ) ],

	getInitialState() {
		return {
			fields: { destination: '', mailbox: '' },
			formSubmitting: false,
			showForm: false,
		};
	},

	componentWillMount() {
		this.formStateController = formState.Controller( {
			initialFields: this.getInitialState().fields,
			onNewState: this.setFormState,
			validatorFunction: ( fieldValues, onComplete ) => {
				onComplete( null, validateAllFields( fieldValues ) );
			},
		} );

		this.setFormState( this.formStateController.getInitialState() );
	},

	hasForwards() {
		return this.props.emailForwards.length > 0;
	},

	hasReachedLimit() {
		return this.props.emailForwards.length >= this.props.emailForwardingLimit;
	},

	onAddEmailForward( event ) {
		event.preventDefault();

		if ( this.state.formSubmitting ) {
			return;
		}

		this.setState( { formSubmitting: true } );

		this.formStateController.handleSubmit( hasErrors => {
			if ( hasErrors ) {
				this.setState( { formSubmitting: false } );
				return;
			}

			const { mailbox, destination } = formState.getAllFieldValues( this.state.fields );

			this.recordEvent(
				'addNewEmailForwardClick',
				this.props.selectedDomainName,
				mailbox,
				destination
			);

			this.props.addEmailForward( this.props.selectedDomainName, mailbox, destination );
			this.formStateController.resetFields( this.getInitialState().fields );
			this.setState( { formSubmitting: false, showForm: true } );
		} );
	},

	setFormState( fields ) {
		this.setState( { fields } );
	},

	onShowForm( event ) {
		event.preventDefault();
		this.setState( { showForm: true } );
	},

	addButton() {
		const handler = this.shouldShowForm() ? this.onAddEmailForward : this.onShowForm;

		return (
			<FormButton
				disabled={ this.state.formSubmitting || this.hasReachedLimit() }
				onClick={ handler }
			>
				{ this.props.translate( 'Add New Email Forward' ) }
			</FormButton>
		);
	},

	cancelButton() {
		if ( ! this.shouldShowForm() || ! this.hasForwards() ) {
			return null;
		}

		return (
			<FormButton
				type="button"
				isPrimary={ false }
				disabled={ this.state.formSubmitting }
				onClick={ this.onCancel }
			>
				{ this.props.translate( 'Cancel' ) }
			</FormButton>
		);
	},

	formFooter() {
		return (
			<FormFooter>
				{ this.addButton() }
				{ this.cancelButton() }
			</FormFooter>
		);
	},

	formFields() {
		if ( ! this.shouldShowForm() ) {
			return null;
		}

		const contactText = this.props.translate( 'contact', {
				context: 'part of e-mail address',
				comment: 'As it would be part of an e-mail address contact@example.com',
			} ),
			exampleEmailText = this.props.translate( 'e.g. %(example)s', {
				args: { example: contactText },
			} ),
			isValidMailbox = this.isValid( 'mailbox' ),
			isValidDestination = this.isValid( 'destination' ),
			{ mailbox, destination } = formState.getAllFieldValues( this.state.fields );

		return (
			<div className="email-forwarding__form-content">
				<FormFieldset>
					<FormLabel>{ this.props.translate( 'Emails Sent To' ) }</FormLabel>
					<FormTextInputWithAffixes
						disabled={ this.state.formSubmitting }
						name="mailbox"
						onChange={ this.onChange }
						onFocus={ this.handleFieldFocus.bind( this, 'Mailbox' ) }
						isError={ ! isValidMailbox }
						placeholder={ exampleEmailText }
						type="text"
						suffix={ '@' + this.props.selectedDomainName }
						value={ mailbox }
					/>
					{ ! isValidMailbox && (
						<FormInputValidation
							text={ this.props.translate(
								'Invalid mailbox - only characters [a-z0-9._+-] are allowed'
							) }
							isError={ true }
						/>
					) }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.props.translate( 'Will Be Forwarded To' ) }</FormLabel>
					<FormTextInput
						disabled={ this.state.formSubmitting }
						name="destination"
						onChange={ this.onChange }
						onFocus={ this.handleFieldFocus.bind( this, 'Destination' ) }
						isError={ ! isValidDestination }
						placeholder={ this.props.translate( 'Your Existing Email Address' ) }
						type="text"
						value={ destination }
					/>
					{ ! isValidDestination && (
						<FormInputValidation
							text={ this.props.translate( 'Invalid destination address' ) }
							isError={ true }
						/>
					) }
				</FormFieldset>
			</div>
		);
	},

	shouldShowForm() {
		return ! this.hasReachedLimit() && ( ! this.hasForwards() || this.state.showForm );
	},

	render() {
		const { emailForwards, emailForwardingLimit } = this.props;
		return (
			<form className="email-forwarding__add-new">
				{ emailForwards.length > 0 ? (
					<EmailForwardingLimit
						emailForwardingCount={ emailForwards.length }
						emailForwardingLimit={ emailForwardingLimit }
					/>
				) : null }
				{ this.formFields() }
				{ this.formFooter() }
			</form>
		);
	},

	onCancel() {
		this.setState( { showForm: false } );

		this.recordEvent( 'cancelClick', this.props.selectedDomainName );
	},

	onChange( event ) {
		const { name } = event.target;
		let { value } = event.target;

		value = value.replace( /\s/g, '' );
		if ( name === 'mailbox' ) {
			// Removes the domain part
			value = value.replace( /@.*$/, '' );
		}

		this.formStateController.handleFieldChange( {
			name,
			value,
		} );
	},

	isValid( fieldName ) {
		return ! formState.isFieldInvalid( this.state.fields, fieldName );
	},

	handleFieldFocus( fieldName ) {
		this.recordEvent( 'inputFocus', this.props.selectedDomainName, fieldName );
	},
} );

export default connect(
	null,
	{ addEmailForward }
)( localize( EmailForwardingAddNew ) );
