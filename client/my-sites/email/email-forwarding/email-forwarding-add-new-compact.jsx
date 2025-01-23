import { Button, FormInputValidation, FormLabel, Gridicon } from '@automattic/components';
import emailValidator from 'email-validator';
import { localize, useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CardHeading from 'calypso/components/card-heading';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import { validateAllFields } from 'calypso/lib/domains/email-forwarding';
import formState from 'calypso/lib/form-state';

function RecursiveInputField( { values, onChange, disabled, index = 0 } ) {
	const translate = useTranslate();
	const value = values[ index ];
	const isValid = emailValidator.validate( value );
	const [ initialized, setInitialized ] = React.useState( false );

	function handleChange( event ) {
		const newValues = [ ...values ];
		newValues[ index ] = event.target.value;
		onChange( newValues );
	}

	return (
		<>
			<FormFieldset key={ index }>
				<FormLabel>{ translate( 'Will be forwarded to this email address' ) }</FormLabel>
				<FormTextInput
					disabled={ disabled }
					onChange={ handleChange }
					isError={ ! isValid && initialized }
					value={ value }
					onBlur={ () => setInitialized( !! value ) }
				/>
				{ ! isValid && initialized && (
					<FormInputValidation text={ translate( 'Invalid email address' ) } isError />
				) }
			</FormFieldset>
			{ value?.trim() && index < 4 && (
				<RecursiveInputField values={ values } onChange={ onChange } index={ index + 1 } />
			) }
		</>
	);
}

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
		const { mailbox, destinations } = fields;
		const mailboxError = this.getError( 'mailbox' );

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
						onChange={ ( event ) => this.onMailboxChange( event, index ) }
						isError={ ! isValidMailbox }
						suffix={ '@' + selectedDomainName }
						value={ mailbox }
					/>
					{ ! isValidMailbox && <FormInputValidation text={ mailboxError } isError /> }
				</FormFieldset>
				<RecursiveInputField
					values={ destinations }
					disabled={ this.props.disabled }
					onChange={ this.onDestinationsChange }
				/>
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

	onMailboxChange = ( event ) => {
		const value = event.target.value.replace( /\s/g, '' ).replace( /@.*$/, '' );
		this.props.onUpdateEmailForward( { index: 0, name: 'mailbox', value } );
		this.formStateController.handleFieldChange( {
			name: 'mailbox',
			value,
		} );
	};
	onDestinationsChange = ( value ) => {
		this.formStateController.handleFieldChange( {
			name: 'destinations',
			value,
		} );
		this.props.onUpdateEmailForward( { index: 0, name: 'destinations', value } );
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

		return null;
	}
}

export default localize( EmailForwardingAddNewCompact );
