import { Button, FormInputValidation, FormLabel, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import CardHeading from 'calypso/components/card-heading';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import { validateAllFields } from 'calypso/lib/domains/email-forwarding';
import formState from 'calypso/lib/form-state';
class EmailForwardingAddNewCompact extends Component {
	static propTypes = {
		fields: PropTypes.object,
		index: PropTypes.number,
		onAddEmailForward: PropTypes.func.isRequired,
		onRemoveEmailForward: PropTypes.func.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		onUpdateEmailForward: PropTypes.func.isRequired,
		emailForwards: PropTypes.array,
		showFormHeader: PropTypes.bool,
	};

	isMounted = false;

	constructor( props ) {
		super( props );

		this.state = {
			fields: this.props.fields,
		};

		this.formStateController = formState.Controller( {
			initialFields: this.getInitialFields(),
			onNewState: this.setFormState,
			validatorFunction: ( fieldValues, onComplete ) => {
				onComplete( null, validateAllFields( fieldValues, this.props.emailForwards ?? [] ) );
			},
		} );
	}

	componentDidMount() {
		this.isMounted = true;
	}

	componentWillUnmount() {
		this.isMounted = false;
	}

	getInitialFields() {
		return this.props.fields;
	}

	setFormState = ( fields ) => {
		if ( this.isMounted ) {
			this.setState( { fields } );
		}
	};

	renderAddButton() {
		const { onAddEmailForward, onButtonClick, translate } = this.props;
		return (
			<div className="email-forwarding-add-new-compact__actions">
				<Button
					className="email-forwarding-add-new-compact__add-another-forward-button"
					onClick={ onAddEmailForward }
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

	renderRemoveButton() {
		const updateForm = () => {
			this.props.onRemoveEmailForward( this.props.index );
		};

		return (
			<FormButton type="button" isPrimary={ false } onClick={ () => updateForm() }>
				<Gridicon icon="trash" />
				{ this.props.translate( 'Remove this forward' ) }
			</FormButton>
		);
	}

	renderFormFields() {
		const { translate, selectedDomainName, index, fields, showFormHeader } = this.props;
		const isValidMailbox = this.isValid( 'mailbox' );
		const isValidDestination = this.isValid( 'destination' );
		const { mailbox, destination } = fields;
		const mailboxError = this.getError( 'mailbox' );
		const destinationError = this.getError( 'destination' );

		return (
			<div className="email-forwarding__form-content">
				{ showFormHeader ? (
					<CardHeading>{ translate( 'New email forwarding address' ) }</CardHeading>
				) : null }
				<FormFieldset>
					<FormLabel>{ translate( 'Emails sent to' ) }</FormLabel>
					<FormTextInputWithAffixes
						disabled={ this.props.disabled }
						name="mailbox"
						onChange={ ( event ) => this.onChange( event, index ) }
						isError={ ! isValidMailbox }
						suffix={ '@' + selectedDomainName }
						value={ mailbox }
					/>
					{ ! isValidMailbox && <FormInputValidation text={ mailboxError } isError /> }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ translate( 'Will be forwarded to this email address' ) }</FormLabel>
					<FormTextInput
						disabled={ this.props.disabled }
						name="destination"
						onChange={ ( event ) => this.onChange( event, index ) }
						isError={ ! isValidDestination }
						value={ destination }
					/>
					{ ! isValidDestination && <FormInputValidation text={ destinationError } isError /> }
				</FormFieldset>
			</div>
		);
	}

	render() {
		return (
			<>
				{ this.renderFormFields() }
				{ this.props.index > 0 ? this.renderRemoveButton() : null }
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

		this.props.onUpdateEmailForward( index, name, value );
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
				return translate( 'Only numbers, letters, dashes, underscores, and periods are allowed.' );
			}

			if ( errorMessage.filter( ( t ) => t === 'Duplicated' ).length === 1 ) {
				return translate( 'Please use unique mailboxes' );
			}
		}

		if ( fieldName === 'destination' ) {
			if ( errorMessage.filter( ( t ) => t === 'Invalid' ).length === 1 ) {
				return translate( 'Invalid email address' );
			}
		}

		return null;
	}
}

export default localize( EmailForwardingAddNewCompact );
