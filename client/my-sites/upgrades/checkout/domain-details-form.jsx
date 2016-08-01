/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import map from 'lodash/map';
import camelCase from 'lodash/camelCase';
import kebabCase from 'lodash/kebabCase';
import head from 'lodash/head';

/**
 * Internal dependencies
 */
import { CountrySelect, StateSelect, Input, HiddenInput } from 'my-sites/upgrades/components/form';
import PrivacyProtection from './privacy-protection';
import PaymentBox from './payment-box';
import { cartItems } from 'lib/cart-values';
import { forDomainRegistrations as countriesListForDomainRegistrations } from 'lib/countries-list';
import { forDomainRegistrations as statesListForDomainRegistrations } from 'lib/states-list';
import analytics from 'lib/analytics';
import formState from 'lib/form-state';
import { addPrivacyToAllDomains, removePrivacyFromAllDomains, setDomainDetails } from 'lib/upgrades/actions';
import FormButton from 'components/forms/form-button';

// Cannot convert to ES6 import
const wpcom = require( 'lib/wp' ).undocumented(),
	countriesList = countriesListForDomainRegistrations(),
	statesList = statesListForDomainRegistrations();

export default React.createClass( {
	displayName: 'DomainDetailsForm',

	fieldNames: [
		'firstName',
		'lastName',
		'organization',
		'email',
		'phone',
		'address1',
		'address2',
		'city',
		'state',
		'postalCode',
		'countryCode',
		'fax'
	],

	getInitialState() {
		return {
			form: null,
			isDialogVisible: false,
			submissionCount: 0
		};
	},

	componentWillMount() {
		this.formStateController = formState.Controller( {
			fieldNames: this.fieldNames,
			loadFunction: wpcom.getDomainContactInformation.bind( wpcom ),
			sanitizerFunction: this.sanitize,
			validatorFunction: this.validate,
			onNewState: this.setFormState,
			onError: this.handleFormControllerError
		} );

		this.setState( { form: this.formStateController.getInitialState() } );
	},

	componentDidMount() {
		analytics.pageView.record( '/checkout/domain-contact-information', 'Checkout > Domain Contact Information' );
	},

	sanitize( fieldValues, onComplete ) {
		const sanitizedFieldValues = Object.assign( {}, fieldValues );
		this.fieldNames.forEach( ( fieldName ) => {
			if ( typeof fieldValues[ fieldName ] === 'string' ) {
				sanitizedFieldValues[ fieldName ] = fieldValues[ fieldName ].trim();
				if ( fieldName === 'postalCode' ) {
					sanitizedFieldValues[ fieldName ] = sanitizedFieldValues[ fieldName ].toUpperCase();
				}
			}
		} );

		onComplete( sanitizedFieldValues );
	},

	validate( fieldValues, onComplete ) {
		const domainNames = map( cartItems.getDomainRegistrations( this.props.cart ), 'meta' );

		wpcom.validateDomainContactInformation( fieldValues, domainNames, ( error, data ) => {
			const messages = data && data.messages || {};
			onComplete( error, messages );
		} );
	},

	setFormState( form ) {
		if ( ! this.isMounted() ) {
			return;
		}

		if ( ! this.needsFax() ) {
			delete form.fax;
		}

		this.setState( { form } );
	},

	handleFormControllerError( error ) {
		throw error;
	},

	handleChangeEvent( event ) {
		// Resets the state field every time the user selects a different country
		if ( event.target.name === 'country-code' ) {
			this.formStateController.handleFieldChange( {
				name: 'state',
				value: '',
				hideError: true
			} );
		}

		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: event.target.value
		} );
	},

	getNumberOfDomainRegistrations() {
		return cartItems.getDomainRegistrations( this.props.cart ).length;
	},

	getFieldProps( name ) {
		return {
			name,
			ref: name,
			additionalClasses: 'checkout-field',
			value: formState.getFieldValue( this.state.form, name ),
			isError: formState.isFieldInvalid( this.state.form, name ),
			disabled: formState.isFieldDisabled( this.state.form, name ),
			onChange: this.handleChangeEvent,
			// The keys are mapped to snake_case when going to API and camelCase when the response is parsed and we are using
			// kebab-case for HTML, so instead of using different variations all over the place, this accepts kebab-case and
			// converts it to camelCase which is the format stored in the formState.
			errorMessage: ( formState.getFieldErrorMessages( this.state.form, camelCase( name ) ) || [] ).join( '\n' ),
			eventFormName: 'Checkout Form'
		};
	},

	needsFax() {
		return formState.getFieldValue( this.state.form, 'countryCode' ) === 'NL' && cartItems.hasNlTld( this.props.cart );
	},

	allDomainRegistrationsHavePrivacy() {
		return cartItems.getDomainRegistrationsWithoutPrivacy( this.props.cart ).length === 0;
	},

	renderSubmitButton() {
		return (
			<FormButton className="checkout__domain-details-form-submit-button" onClick={ this.handleSubmitButtonClick }>
				{ this.translate( 'Continue to Checkout' ) }
			</FormButton>
		);
	},

	renderPrivacySection() {
		return (
			<PrivacyProtection
				cart={ this.props.cart }
				countriesList={ countriesList }
				disabled={ formState.isSubmitButtonDisabled( this.state.form ) }
				fields={ this.state.form }
				isChecked={ this.allDomainRegistrationsHavePrivacy() }
				onCheckboxChange={ this.handleCheckboxChange }
				onDialogClose={ this.closeDialog }
				onDialogOpen={ this.openDialog }
				onDialogSelect={ this.handlePrivacyDialogSelect }
				isDialogVisible={ this.state.isDialogVisible }
				productsList={ this.props.productsList }/>
		);
	},

	fields() {
		const countryCode = formState.getFieldValue( this.state.form, 'countryCode' ),
			fieldProps = ( name ) => this.getFieldProps( name ),
			textOnly = true;

		return (
			<div>
				<Input
					autofocus
					label={ this.translate( 'First Name', { textOnly } ) }
					{ ...fieldProps( 'first-name' ) }/>

				<Input label={ this.translate( 'Last Name', { textOnly } ) } { ...fieldProps( 'last-name' ) }/>

				<HiddenInput
					label={ this.translate( 'Organization' ) }
					text={ this.translate(
						'Registering this domain for a company? + Add Organization Name',
						'Registering these domains for a company? + Add Organization Name',
						{
							context: 'Domain contact information page',
							comment: 'Count specifies the number of domain registrations',
							count: this.getNumberOfDomainRegistrations(),
							textOnly: true
						}
					) }
					{ ...fieldProps( 'organization' ) }/>

				<Input label={ this.translate( 'Email', { textOnly } ) } { ...fieldProps( 'email' ) }/>
				<Input
					label={ this.translate( 'Phone', { textOnly } ) }
					placeholder={ this.translate(
						'e.g. +1.555.867.5309',
						{
							context: 'Domain contact info phone placeholder',
							comment: 'Please use the phone number format most common for your language, but it must begin with just the country code in the format \'+1\' - no parenthesis, leading zeros, etc.'
						}
					) }
					{ ...fieldProps( 'phone' ) }/>

				<CountrySelect
					label={ this.translate( 'Country', { textOnly } ) }
					countriesList={ countriesList }
					{ ...fieldProps( 'country-code' ) }/>

				{ this.needsFax() && <Input label={ this.translate( 'Fax', { textOnly } ) } { ...fieldProps( 'fax' ) }/> }
				<Input label={ this.translate( 'Address', { textOnly } ) } maxLength={ 40 } { ...fieldProps( 'address-1' ) }/>

				<HiddenInput
					label={ this.translate( 'Address Line 2', { textOnly } ) }
					text={ this.translate( '+ Add Address Line 2', { textOnly } ) }
					maxLength={ 40 }
					{ ...fieldProps( 'address-2' ) }/>

				<Input label={ this.translate( 'City', { textOnly } ) } { ...fieldProps( 'city' ) }/>

				<StateSelect
					label={ this.translate( 'State', { textOnly: true } ) }
					countryCode={ countryCode }
					statesList={ statesList }
					{ ...fieldProps( 'state' ) }/>

				<Input label={ this.translate( 'Postal Code', { textOnly } ) } { ...fieldProps( 'postal-code' ) }/>

				{ this.renderSubmitButton() }
			</div>
		);
	},

	handleCheckboxChange() {
		this.setPrivacyProtectionSubscriptions( ! this.allDomainRegistrationsHavePrivacy() );
	},

	closeDialog() {
		this.setState( { isDialogVisible: false } );
	},

	openDialog() {
		this.setState( { isDialogVisible: true } );
	},

	content() {
		return (
			<form>
				{ this.fields() }
			</form>
		);
	},

	focusFirstError() {
		this.refs[ kebabCase( head( map( formState.getInvalidFields( this.state.form ), 'name' ) ) ) ].focus();
	},

	handleSubmitButtonClick( event ) {
		event.preventDefault();

		this.formStateController.handleSubmit( ( hasErrors ) => {
			this.recordSubmit();

			if ( hasErrors ) {
				this.focusFirstError();
				return;
			}

			if ( ! this.allDomainRegistrationsHavePrivacy() ) {
				this.openDialog();
				return;
			}

			this.finish();
		} );
	},

	recordSubmit() {
		const errors = formState.getErrorMessages( this.state.form );
		analytics.tracks.recordEvent( 'calypso_contact_information_form_submit', {
			errors,
			errors_count: errors && errors.length || 0,
			submission_count: this.state.submissionCount + 1
		} );
		this.setState( { submissionCount: this.state.submissionCount + 1 } );
	},

	handlePrivacyDialogSelect( options ) {
		this.formStateController.handleSubmit( ( hasErrors ) => {
			this.recordSubmit();

			if ( hasErrors || options.skipFinish ) {
				this.setPrivacyProtectionSubscriptions( options.addPrivacy !== false );
				this.closeDialog();
				return;
			}

			this.finish( options );
		} );
	},

	finish( options = {} ) {
		this.setPrivacyProtectionSubscriptions( options.addPrivacy !== false );

		setDomainDetails( formState.getAllFieldValues( this.state.form ) );
	},

	setPrivacyProtectionSubscriptions( enable ) {
		if ( enable ) {
			addPrivacyToAllDomains();
		} else {
			removePrivacyFromAllDomains();
		}
	},

	render() {
		const classSet = classNames( {
			'domain-details': true,
			selected: true
		} );

		return (
			<div>
				{ this.renderPrivacySection() }
				<PaymentBox
					classSet={ classSet }
					title={ this.translate(
						'Domain Contact Information',
						{
							context: 'Domain contact information page',
							textOnly: true
						} ) }>
					{ this.content() }
				</PaymentBox>
			</div>
		);
	}
} );
