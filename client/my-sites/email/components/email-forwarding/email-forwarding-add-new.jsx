/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import React from 'react';

/**
 * Internal dependencies
 */
import EmailForwardingLimit from './email-forwarding-limit';
import { emailForwardingPlanLimit, validateAllFields } from 'lib/domains/email-forwarding';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormFooter from 'my-sites/domains/domain-management/components/form-footer';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import FormInputValidation from 'components/forms/form-input-validation';
import formState from 'lib/form-state';
import notices from 'notices';
import { addEmailForwarding } from 'lib/upgrades/actions';
import { CALYPSO_CONTACT } from 'lib/url/support';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';

class EmailForwardingAddNew extends React.Component {
	static propTypes = {
		addNewEmailForwardClick: PropTypes.func,
		cancelClick: PropTypes.func,
		destinationFieldFocus: PropTypes.func,
		mailboxFieldFocus: PropTypes.func,
		initialShowForm: PropTypes.bool,
		emailForwarding: PropTypes.object,
		selectedSite: PropTypes.string,
		selectedDomainName: PropTypes.string,
	};

	state = {
		fields: { destination: '', mailbox: '' },
		formSubmitting: false,
		showForm: false,
	};

	addNewEmailForwardClick = ( domainName, mailbox, destination, success ) => {
		this.props.addNewEmailForwardClick( domainName, mailbox, destination, success );
	};

	cancelClick = () => {
		this.props.cancelClick( this.props.selectedDomainName );
	};

	destinationFieldFocus = () => {
		this.props.destinationFieldFocus( this.props.selectedDomainName );
	};

	mailboxFieldFocus = () => {
		this.props.mailboxFieldFocus( this.props.selectedDomainName );
	};

	componentWillMount() {
		this.formStateController = formState.Controller( {
			initialFields: this.state.fields,
			onNewState: this.setFormState,
			validatorFunction: ( fieldValues, onComplete ) => {
				onComplete( null, validateAllFields( fieldValues ) );
			},
		} );

		this.setFormState( this.formStateController.getInitialState() );
	}

	hasForwards() {
		return this.props.emailForwarding.list.length > 0;
	}

	hasReachedLimit() {
		return (
			this.props.emailForwarding.list.length >=
			emailForwardingPlanLimit( this.props.selectedSite.plan )
		);
	}

	onAddEmailForward = event => {
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

			addEmailForwarding( this.props.selectedDomainName, mailbox, destination, error => {
				this.addNewEmailForwardClick(
					this.props.selectedDomainName,
					mailbox,
					destination,
					! Boolean( error )
				);

				if ( error ) {
					notices.error(
						error.message ||
							this.props.translate(
								'Failed to add email forwarding record. ' +
									'Please try again or ' +
									'{{contactSupportLink}}contact support{{/contactSupportLink}}.',
								{
									components: {
										contactSupportLink: <a href={ CALYPSO_CONTACT } />,
									},
								}
							)
					);
				} else {
					this.formStateController.resetFields( this.getInitialState().fields );

					notices.success(
						this.props.translate(
							'%(email)s has been successfully added! ' +
								'You must confirm your email before it starts working. ' +
								'Please check your inbox for %(destination)s.',
							{
								args: {
									email: mailbox + '@' + this.props.selectedDomainName,
									destination: destination,
								},
							}
						),
						{
							duration: 5000,
						}
					);
				}
				this.setState( { formSubmitting: false, showForm: ! error } );
			} );
		} );
	};

	setFormState = fields => {
		this.setState( { fields } );
	};

	onShowForm = event => {
		event.preventDefault();
		this.setState( { showForm: true } );
	};

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
				onClick={ this.onCancel }
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

		const { translate, selectedDomainName } = this.props;

		const contactText = translate( 'contact', {
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
		return (
			<form className="email-forwarding__add-new">
				<EmailForwardingLimit
					selectedSite={ this.props.selectedSite }
					emailForwarding={ this.props.emailForwarding }
				/>

				{ this.formFields() }

				{ this.formFooter() }
			</form>
		);
	}

	onCancel = () => {
		this.setState( { showForm: false } );
		this.props.cancelClick();
	};

	onChange = event => {
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
}

const mapDispatchToProps = dispatch => ( {
	addNewEmailForwardClick: ( domainName, mailbox, destination, success ) => {
		dispatch(
			composeAnalytics(
				recordGoogleEvent(
					'Domain Management',
					'Clicked "Add New Email Forward" Button in Email Forwarding',
					'Domain Name',
					domainName
				),
				recordTracksEvent(
					'calypso_domain_management_email_forwarding_add_new_email_forward_click',
					{
						destination,
						domain_name: domainName,
						mailbox,
						success,
					}
				)
			)
		);
	},

	cancelClick: domainName => {
		dispatch(
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
			)
		);
	},

	destinationFieldFocus: domainName => {
		dispatch(
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
			)
		);
	},

	mailboxFieldFocus: domainName => {
		dispatch(
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
			)
		);
	},
} );

export default connect(
	null,
	mapDispatchToProps
)( localize( EmailForwardingAddNew ) );
