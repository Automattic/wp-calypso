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

const MAX_FORWARD_DESTINATIONS = 5;

/**
 * An input field that keeps repeating itself for MAX_FORWARD_DESTINATIONS times.
 */
function RecursiveInputField( props ) {
	const {
		values,
		onChange,
		selectedDomainName,
		index = 0,
		disabled,
		existingForwardsForMailbox,
	} = props;

	/** Count existing forwards before showing one more field */
	const limit = MAX_FORWARD_DESTINATIONS - existingForwardsForMailbox - 1;
	const translate = useTranslate();
	const value = values[ index ];
	const sameDomain = value?.endsWith( `@${ selectedDomainName }` );
	const isValid = emailValidator.validate( value );
	const [ initialized, setInitialized ] = React.useState( false );
	// In case of duplicates, only warn at the second duplicate.
	const hasDuplicates = values.some( ( v, valueIndex ) => v === value && valueIndex < index );
	// But highlight the duplicated field any way.
	const shouldHighlightForDuplicates = values.filter( ( v ) => v === value ).length > 1;

	function handleChange( event ) {
		const newValues = [ ...values ];
		newValues[ index ] = event.target.value.toLowerCase().trim();
		onChange( newValues );
	}

	return (
		<>
			<FormFieldset key={ index }>
				{ index === 0 && (
					<FormLabel>{ translate( 'Will be forwarded to these email addresses' ) }</FormLabel>
				) }
				<FormTextInput
					disabled={ disabled }
					onChange={ handleChange }
					isError={ ( ! isValid && initialized ) || shouldHighlightForDuplicates || sameDomain }
					value={ value }
					onBlur={ () => setInitialized( !! value ) }
					placeholder={ translate( 'Target email address' ) }
				/>
				{ ! isValid && initialized && (
					<FormInputValidation text={ translate( 'Invalid email address' ) } isError />
				) }
				{ sameDomain && (
					// Not sure why, but this is a backend limitation
					<FormInputValidation
						text={ translate( "You can't forward to an address on the same source domain" ) }
						isError
					/>
				) }
				{ isValid && hasDuplicates && (
					<FormInputValidation text={ translate( 'This email is duplicated' ) } isError />
				) }
			</FormFieldset>
			{ value?.trim() && index < limit && <RecursiveInputField { ...props } index={ index + 1 } /> }
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

	/**
	 * @type {import('calypso/lib/form-state').Controller}
	 */
	formStateController;

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
		const { translate, selectedDomainName, index, fields, showFormHeader, emailForwards } =
			this.props;
		const isValidMailbox = this.isValid( 'mailbox' );
		const { mailbox, destinations } = fields;
		const mailboxError = this.getError( 'mailbox' );

		// Compare while ignoring case, diacritics, etc..
		const existingForwardsForMailbox = emailForwards?.filter(
			( forward ) =>
				forward.mailbox.localeCompare( mailbox, undefined, { sensitivity: 'base' } ) === 0
		).length;

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
					selectedDomainName={ selectedDomainName }
					existingForwardsForMailbox={ existingForwardsForMailbox }
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
		const value = event.target.value.replace( /\s/g, '' ).replace( /@.*$/, '' ).toLowerCase();
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

			if ( errorMessage.filter( ( t ) => t === 'Exhausted' ).length === 1 ) {
				return translate( 'Each mailbox can redirect to up to five email addresses' );
			}
		}

		return null;
	}
}

export default localize( EmailForwardingAddNewCompact );
