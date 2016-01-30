/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import EmailForwardingLimit from './email-forwarding-limit';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormFooter from 'my-sites/upgrades/domain-management/components/form-footer';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import analyticsMixin from 'lib/mixins/analytics';
import notices from 'notices';
import * as upgradesActions from 'lib/upgrades/actions';
import { successNotice } from 'state/notices/actions';


const EmailForwardingAddNew = React.createClass( {
	propTypes: {
		initialShowForm: React.PropTypes.bool
	},

	mixins: [ analyticsMixin( 'domainManagement', 'emailForwarding' ) ],

	getInitialState() {
		return {
			destination: null,
			formSubmitting: false,
			mailbox: null,
			showForm: false
		};
	},

	hasForwards() {
		return this.props.emailForwarding.list.length > 0;
	},

	hasReachedLimit() {
		return this.props.emailForwarding.list.length >= 5;
	},

	onAddEmailForward( event ) {
		event.preventDefault();

		if ( this.state.formSubmitting ) {
			return false;
		}

		this.setState( { formSubmitting: true } );

		upgradesActions.addEmailForwarding( this.props.selectedDomainName, this.state.mailbox, this.state.destination, ( error ) => {
			this.setState( { formSubmitting: false } );

			this.recordEvent( 'addNewEmailForwardClick', this.props.selectedDomainName, this.state.mailbox, this.state.destination, ! Boolean( error ) );

			if ( error ) {
				notices.error( error.message );
			} else {
				this.props.successNotice( this.translate( 'Yay, %(email)s has been successfully added!', { args: {
					email: this.state.mailbox + '@' + this.props.selectedDomainName
				} } ) );

				this.clearForm();
			}
		} );
	},

	clearForm() {
		this.setState( { mailbox: null, destination: null } );
	},

	onShowForm( event ) {
		event.preventDefault();
		this.setState( { showForm: true } );
	},

	addButton() {
		var handler = this.shouldShowForm() ? this.onAddEmailForward : this.onShowForm;
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
		const exampleEmailText = this.translate( 'e.g. contact', {
			textOnly: true,
			comment: 'Placeholder text with an example email address'
		} );

		if ( ! this.shouldShowForm() ) {
			return null;
		}

		return (
			<div className="form-content">
				<FormFieldset>
					<FormLabel>{ this.translate( 'Emails Sent To' ) }</FormLabel>
					<FormTextInputWithAffixes
						disabled={ this.state.formSubmitting }
						name="mailbox"
						onChange={ this.handleFieldChange.bind( this, 'mailbox' ) }
						onFocus={ this.handleFieldFocus.bind( this, 'Mailbox' ) }
						placeholder={ exampleEmailText }
						type="text"
						suffix={ '@' + this.props.selectedDomainName }
						value={ this.state.mailbox } />
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.translate( 'Will Be Forwarded To' ) }</FormLabel>
					<FormTextInput
						disabled={ this.state.formSubmitting }
						name="destination"
						onChange={ this.handleFieldChange.bind( this, 'destination' ) }
						onFocus={ this.handleFieldFocus.bind( this, 'Destination' ) }
						placeholder={ this.translate( 'Your Existing Email Address' ) }
						type="text"
						value={ this.state.destination } />
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

	handleFieldChange( fieldName, event ) {
		let value = event.target.value;

		if ( fieldName === 'mailbox' ) {
			// Removes the domain part
			value = value.replace( /@.*/, '' );
		}

		this.setState( {
			[ fieldName ]: value
		} );
	},

	handleFieldFocus( fieldName ) {
		this.recordEvent( 'inputFocus', this.props.selectedDomainName, fieldName );
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( { successNotice }, dispatch )
)( EmailForwardingAddNew );
