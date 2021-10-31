import { Button, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import { validateAllFields } from 'calypso/lib/domains/email-forwarding';
import formState from 'calypso/lib/form-state';

class EmailForwardingAddNewCompact extends Component {
	static propTypes = {
		fields: PropTypes.object,
		index: PropTypes.number,
		removeHandler: PropTypes.func.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		updateHandler: PropTypes.func.isRequired,
		emailForwards: PropTypes.array,
	};

	state = {
		formSubmitting: false,
		fields: this.props.fields,
	};

	getInitialFields() {
		return this.props.fields;
	}

	getInitialFormState() {
		return {
			formSubmitting: false,
			fields: this.props.fields,
		};
	}

	UNSAFE_componentWillMount() {
		this.formStateController = formState.Controller( {
			initialFields: this.getInitialFields(),
			onNewState: this.setFormState,
			validatorFunction: ( fieldValues, onComplete ) => {
				onComplete( null, validateAllFields( fieldValues, this.props.emailForwards ?? [] ) );
			},
		} );

		this.setFormState( this.formStateController.getInitialState() );
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

	addButton() {
		const { onButtonClick, translate } = this.props;
		return (
			<div className="email-forwarding-add-new-compact__actions">
				<Button
					className="email-forwarding-add-new-compact__add-another-forward-button"
					onClick={ this.onForwardAdd }
				>
					<Gridicon icon="plus" />
					<span>{ translate( 'Add another forward' ) }</span>
				</Button>

				<Button primary onClick={ onButtonClick }>
					{ translate( 'Add' ) }
				</Button>
			</div>
		);
	}

	removeButton() {
		const updateForm = () => {
			this.props.removeHandler( this.props.index );
		};

		return (
			<FormButton type="button" isPrimary={ false } onClick={ () => updateForm() }>
				<Gridicon icon="trash" />
				{ this.props.translate( 'Remove this forward' ) }
			</FormButton>
		);
	}

	formFields() {
		const { translate, selectedDomainName, index, fields } = this.props;
		const contactText = translate( 'contact', {
			context: 'part of e-mail address',
			comment: 'As it would be part of an e-mail address contact@example.com',
		} );
		const exampleEmailText = translate( 'e.g. %(example)s', {
			args: { example: contactText },
		} );
		const isValidMailbox = this.isValid( 'mailbox' );
		const isValidDestination = this.isValid( 'destination' );
		const { mailbox, destination } = fields;
		const mailboxError = this.getError( 'mailbox' );
		const destinationError = this.getError( 'destination' );

		return (
			<div className="email-forwarding__form-content">
				<FormFieldset>
					<FormLabel>{ translate( 'Emails Sent To' ) }</FormLabel>
					<FormTextInputWithAffixes
						disabled={ this.state.formSubmitting }
						name="mailbox"
						onChange={ ( event ) => this.onChange( event, index ) }
						isError={ ! isValidMailbox }
						placeholder={ exampleEmailText }
						suffix={ '@' + selectedDomainName }
						value={ mailbox }
					/>
					{ ! isValidMailbox && <FormInputValidation text={ mailboxError } isError={ true } /> }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ translate( 'Will Be Forwarded To' ) }</FormLabel>
					<FormTextInput
						disabled={ this.state.formSubmitting }
						name="destination"
						onChange={ ( event ) => this.onChange( event, index ) }
						isError={ ! isValidDestination }
						placeholder={ translate( 'Your Existing Email Address' ) }
						value={ destination }
					/>
					{ ! isValidDestination && (
						<FormInputValidation text={ destinationError } isError={ true } />
					) }
				</FormFieldset>
			</div>
		);
	}

	render() {
		return (
			<>
				{ this.formFields() }
				{ this.props.index > 0 ? this.removeButton() : null }
			</>
		);
	}

	onChange = ( event, index ) => {
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

		this.props.updateHandler( index, name, value );
	};

	isValid( fieldName ) {
		return ! formState.isFieldInvalid( this.state.fields, fieldName );
	}

	getError( fieldName ) {
		const { translate } = this.props;
		const errorMessage = formState.getFieldErrorMessages( this.state.fields, fieldName );
		if ( ! errorMessage ) {
			return null;
		}
		if ( fieldName === 'mailbox' ) {
			if ( errorMessage.filter( ( t ) => t === 'Invalid' ).length === 1 ) {
				return translate( 'Invalid mailbox - only characters [a-z0-9._+-] are allowed' );
			}
			if ( errorMessage.filter( ( t ) => t === 'Repeated' ).length === 1 ) {
				return translate( 'Invalid mailbox - Duplicated' );
			}
		}
		if ( fieldName === 'destination' ) {
			if ( errorMessage.filter( ( t ) => t === 'Invalid' ).length === 1 ) {
				return translate( 'Invalid destination address' );
			}
		}

		return null;
	}
}

export default localize( EmailForwardingAddNewCompact );
