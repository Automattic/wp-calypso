/**
 * External dependencies
 */
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

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
import { addEmailForward } from 'state/email-forwarding/actions';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';

class EmailForwardingAddNew extends React.Component {
	static propTypes = {
		trackCancelClick: PropTypes.func.isRequired,
		trackDestinationFieldFocus: PropTypes.func.isRequired,
		trackMailboxFieldFocus: PropTypes.func.isRequired,
		initialShowForm: PropTypes.bool,
		addNewEmailForwardWithAnalytics: PropTypes.func.isRequired,
		emailForwards: PropTypes.array,
		emailForwardingLimit: PropTypes.number.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
	};

	state = {
		fields: { destination: '', mailbox: '' },
		formSubmitting: false,
		showForm: false,
	};

	getInitialFields() {
		return { destination: '', mailbox: '' };
	}

	getInitialFormState() {
		return {
			fields: { destination: '', mailbox: '' },
			formSubmitting: false,
			showForm: false,
		};
	}

	UNSAFE_componentWillMount() {
		this.formStateController = formState.Controller( {
			initialFields: this.getInitialFields(),
			onNewState: this.setFormState,
			validatorFunction: ( fieldValues, onComplete ) => {
				onComplete( null, validateAllFields( fieldValues ) );
			},
		} );

		this.setFormState( this.formStateController.getInitialState() );
	}

	hasForwards() {
		return this.props.emailForwards.length > 0;
	}

	hasReachedLimit() {
		return this.props.emailForwards.length >= this.props.emailForwardingLimit;
	}

	addNewEmailForwardClick = ( event ) => {
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

			this.props.addNewEmailForwardWithAnalytics(
				this.props.selectedDomainName,
				mailbox,
				destination
			);
			this.formStateController.resetFields( this.getInitialFields() );
			this.setState( { formSubmitting: false, showForm: true } );
		} );
	};

	setFormState = ( fields ) => {
		this.setState( { fields } );
	};

	onShowForm = ( event ) => {
		event.preventDefault();
		this.setState( { showForm: true } );
	};

	addButton() {
		const handler = this.shouldShowForm() ? this.addNewEmailForwardClick : this.onShowForm;

		return (
			<FormButton
				disabled={ this.state.formSubmitting || this.hasReachedLimit() }
				onClick={ handler }
			>
				{ this.props.translate( 'Add new email address' ) }
			</FormButton>
		);
	}

	cancelButton() {
		if ( ! this.shouldShowForm() || ! this.hasForwards() ) {
			return null;
		}

		return (
			<FormButton
				type="button"
				isPrimary={ false }
				disabled={ this.state.formSubmitting }
				onClick={ this.cancelClick }
			>
				{ this.props.translate( 'Cancel' ) }
			</FormButton>
		);
	}

	formFooter() {
		return (
			<FormFooter>
				{ this.addButton() }
				{ this.cancelButton() }
			</FormFooter>
		);
	}

	formFields() {
		if ( ! this.shouldShowForm() ) {
			return null;
		}

		const { translate, selectedDomainName } = this.props,
			contactText = translate( 'contact', {
				context: 'part of e-mail address',
				comment: 'As it would be part of an e-mail address contact@example.com',
			} ),
			exampleEmailText = translate( 'e.g. %(example)s', {
				args: { example: contactText },
			} ),
			isValidMailbox = this.isValid( 'mailbox' ),
			isValidDestination = this.isValid( 'destination' ),
			{ mailbox, destination } = formState.getAllFieldValues( this.state.fields );

		return (
			<div className="email-forwarding__form-content">
				<FormFieldset>
					<FormLabel>{ translate( 'Emails Sent To' ) }</FormLabel>
					<FormTextInputWithAffixes
						disabled={ this.state.formSubmitting }
						name="mailbox"
						onChange={ this.onChange }
						onFocus={ this.mailboxFieldFocus }
						isError={ ! isValidMailbox }
						placeholder={ exampleEmailText }
						type="text"
						suffix={ '@' + selectedDomainName }
						value={ mailbox }
					/>
					{ ! isValidMailbox && (
						<FormInputValidation
							text={ translate( 'Invalid mailbox - only characters [a-z0-9._+-] are allowed' ) }
							isError={ true }
						/>
					) }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ translate( 'Will Be Forwarded To' ) }</FormLabel>
					<FormTextInput
						disabled={ this.state.formSubmitting }
						name="destination"
						onChange={ this.onChange }
						onFocus={ this.destinationFieldFocus }
						isError={ ! isValidDestination }
						placeholder={ translate( 'Your Existing Email Address' ) }
						type="text"
						value={ destination }
					/>
					{ ! isValidDestination && (
						<FormInputValidation
							text={ translate( 'Invalid destination address' ) }
							isError={ true }
						/>
					) }
				</FormFieldset>
			</div>
		);
	}

	shouldShowForm() {
		return ! this.hasReachedLimit() && ( ! this.hasForwards() || this.state.showForm );
	}

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
	}

	cancelClick = () => {
		this.setState( { showForm: false } );
		this.props.trackCancelClick( this.props.selectedDomainName );
	};

	onChange = ( event ) => {
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
	};

	isValid( fieldName ) {
		return ! formState.isFieldInvalid( this.state.fields, fieldName );
	}

	destinationFieldFocus = () => {
		this.props.trackDestinationFieldFocus( this.props.selectedDomainName );
	};

	mailboxFieldFocus = () => {
		this.props.trackMailboxFieldFocus( this.props.selectedDomainName );
	};
}

const addNewEmailForwardWithAnalytics = ( domainName, mailbox, destination ) =>
	withAnalytics(
		composeAnalytics(
			recordGoogleEvent(
				'Domain Management',
				'Clicked "Add New Email Forward" Button in Email Forwarding',
				'Domain Name',
				domainName
			),
			recordTracksEvent( 'calypso_domain_management_email_forwarding_add_new_email_forward_click', {
				destination,
				domain_name: domainName,
				mailbox,
			} )
		),
		addEmailForward( domainName, mailbox, destination )
	);

const trackCancelClick = ( domainName ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Cancel" Button in Email Forwarding',
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_domain_management_email_forwarding_cancel_click', {
			domain_name: domainName,
		} )
	);

const trackDestinationFieldFocus = ( domainName ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Focused On Destination Input in Email Forwarding',
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_domain_management_email_forwarding_destination_focus', {
			domain_name: domainName,
		} )
	);

const trackMailboxFieldFocus = ( domainName ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Focused On Mailbox Input in Email Forwarding',
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_domain_management_email_forwarding_mailbox_focus', {
			domain_name: domainName,
		} )
	);

export default connect( null, {
	addNewEmailForwardWithAnalytics,
	trackCancelClick,
	trackDestinationFieldFocus,
	trackMailboxFieldFocus,
} )( localize( EmailForwardingAddNew ) );
