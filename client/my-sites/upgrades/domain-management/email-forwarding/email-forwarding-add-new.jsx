/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import EmailForwardingLimit from './email-forwarding-limit';
import { emailForwardingPlanLimit } from 'lib/domains/email-forwarding';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormFooter from 'my-sites/upgrades/domain-management/components/form-footer';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import FormInputValidation from 'components/forms/form-input-validation';
import formState from 'lib/form-state';
import analyticsMixin from 'lib/mixins/analytics';
import notices from 'notices';
import * as upgradesActions from 'lib/upgrades/actions';
import { validateAllFields } from 'lib/domains/email-forwarding';
import support from 'lib/url/support';

const EmailForwardingAddNew = React.createClass( {
	propTypes: {
		initialShowForm: React.PropTypes.bool
	},

	mixins: [ analyticsMixin( 'domainManagement', 'emailForwarding' ) ],

	getInitialState() {
		return {
			fields: { destination: '', mailbox: '' },
			formSubmitting: false,
			showForm: false
		};
	},

	componentWillMount() {
		this.formStateController = formState.Controller( {
			initialFields: this.getInitialState().fields,
			onNewState: this.setFormState,
			validatorFunction: ( fieldValues, onComplete ) => {
				onComplete( null, validateAllFields( fieldValues ) );
			}
		} );

		this.setFormState( this.formStateController.getInitialState() );
	},

	hasForwards() {
		return this.props.emailForwarding.list.length > 0;
	},

	hasReachedLimit() {
		return this.props.emailForwarding.list.length >= emailForwardingPlanLimit( this.props.selectedSite.plan );
	},

	onAddEmailForward( event ) {
		event.preventDefault();

		if ( this.state.formSubmitting ) {
			return;
		}

		this.setState( { formSubmitting: true } );

		this.formStateController.handleSubmit( ( hasErrors ) => {
			if ( hasErrors ) {
				this.setState( { formSubmitting: false } );
				return;
			}

			const { mailbox, destination } = formState.getAllFieldValues( this.state.fields );

			upgradesActions.addEmailForwarding( this.props.selectedDomainName, mailbox, destination, ( error ) => {
				this.recordEvent( 'addNewEmailForwardClick', this.props.selectedDomainName, mailbox, destination, ! Boolean( error ) );

				if ( error ) {
					notices.error( error.message || this.translate( 'Failed to add email forwarding record. Please try again or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
						{
							components: {
								contactSupportLink: <a href={ support.CALYPSO_CONTACT }/>
							}
						} )
					);
				} else {
					this.formStateController.resetFields( this.getInitialState().fields );

					notices.success(
						this.translate( '%(email)s has been successfully added! You must confirm your email before it starts working. Please check your inbox for %(destination)s.', { args: {
							email: mailbox + '@' + this.props.selectedDomainName,
							destination: destination
						} } ), {
							duration: 5000
						} );
				}
				this.setState( { formSubmitting: false, showForm: ! error } );
			} );
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
				onClick={ handler }>
				{ this.translate( 'Add New Email Forward' ) }
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
				onClick={ this.onCancel }>
				{ this.translate( 'Cancel' ) }
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

		const contactText = this.translate( 'contact', { context: 'part of e-mail address', comment: 'As it would be part of an e-mail address contact@example.com' } ),
			exampleEmailText = this.translate( 'e.g. %(example)s', { args: { example: contactText } } ),
			isValidMailbox = this.isValid( 'mailbox' ),
			isValidDestination = this.isValid( 'destination' ),
			{ mailbox, destination } = formState.getAllFieldValues( this.state.fields );

		return (
			<div className="form-content">
				<FormFieldset>
					<FormLabel>{ this.translate( 'Emails Sent To' ) }</FormLabel>
					<FormTextInputWithAffixes
						disabled={ this.state.formSubmitting }
						name="mailbox"
						onChange={ this.onChange }
						onFocus={ this.handleFieldFocus.bind( this, 'Mailbox' ) }
						isError={ ! isValidMailbox }
						placeholder={ exampleEmailText }
						type="text"
						suffix={ '@' + this.props.selectedDomainName }
						value={ mailbox } />
					{ ! isValidMailbox && <FormInputValidation text={ this.translate( 'Invalid mailbox - only characters [a-z0-9._+-] are allowed' ) } isError={ true }/> }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.translate( 'Will Be Forwarded To' ) }</FormLabel>
					<FormTextInput
						disabled={ this.state.formSubmitting }
						name="destination"
						onChange={ this.onChange }
						onFocus={ this.handleFieldFocus.bind( this, 'Destination' ) }
						isError={ ! isValidDestination }
						placeholder={ this.translate( 'Your Existing Email Address' ) }
						type="text"
						value={ destination } />
					{ ! isValidDestination && <FormInputValidation text={ this.translate( 'Invalid destination address' ) } isError={ true }/> }
				</FormFieldset>
			</div>
		);
	},

	shouldShowForm() {
		return ! this.hasReachedLimit() && ( ! this.hasForwards() || this.state.showForm );
	},

	render() {
		return (
			<form className="email-forwarding__add-new">
				<EmailForwardingLimit
					selectedSite= { this.props.selectedSite }
					emailForwarding={ this.props.emailForwarding } />

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
		let { name, value } = event.target;

		value = value.replace( /\s/g, '' );
		if ( name === 'mailbox' ) {
			// Removes the domain part
			value = value.replace( /@.*$/, '' );
		}

		this.formStateController.handleFieldChange( {
			name,
			value
		} );
	},

	isValid( fieldName ) {
		return ! formState.isFieldInvalid( this.state.fields, fieldName );
	},

	handleFieldFocus( fieldName ) {
		this.recordEvent( 'inputFocus', this.props.selectedDomainName, fieldName );
	}
} );

export default EmailForwardingAddNew;
