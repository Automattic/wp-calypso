/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import {
	camelCase,
	deburr,
	head,
	kebabCase,
	map,
	omit,
	reduce,
} from 'lodash';

/**
 * Internal dependencies
 */
import { CountrySelect, StateSelect, Input, HiddenInput } from 'my-sites/upgrades/components/form';
import PrivacyProtection from './privacy-protection';
import PaymentBox from './payment-box';
import { cartItems } from 'lib/cart-values';
import { forDomainRegistrations as countriesListForDomainRegistrations } from 'lib/countries-list';
import analytics from 'lib/analytics';
import formState from 'lib/form-state';
import { addPrivacyToAllDomains, removePrivacyFromAllDomains, setDomainDetails, addGoogleAppsRegistrationData } from 'lib/upgrades/actions';
import FormButton from 'components/forms/form-button';
import { countries } from 'components/phone-input/data';
import { toIcannFormat } from 'components/phone-input/phone-number';
import FormPhoneMediaInput from 'components/forms/form-phone-media-input';

// Cannot convert to ES6 import
const wpcom = require( 'lib/wp' ).undocumented(),
	countriesList = countriesListForDomainRegistrations();

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
			submissionCount: 0,
			phoneCountryCode: 'US'
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
				sanitizedFieldValues[ fieldName ] = deburr( fieldValues[ fieldName ].trim() );
				if ( fieldName === 'postalCode' ) {
					sanitizedFieldValues[ fieldName ] = sanitizedFieldValues[ fieldName ].toUpperCase();
				}
			}
		} );

		onComplete( sanitizedFieldValues );
	},

	validate( fieldValues, onComplete ) {
		if ( this.needsOnlyGoogleAppsDetails() ) {
			wpcom.validateGoogleAppsContactInformation( fieldValues, this.generateValidationHandler( onComplete ) );
			return;
		}

		const allFieldValues = Object.assign( {}, fieldValues );
		allFieldValues.phone = toIcannFormat( allFieldValues.phone, countries[ this.state.phoneCountryCode ] );
		const domainNames = map( cartItems.getDomainRegistrations( this.props.cart ), 'meta' );
		wpcom.validateDomainContactInformation( allFieldValues, domainNames, this.generateValidationHandler( onComplete ) );
	},

	generateValidationHandler( onComplete ) {
		return ( error, data ) => {
			const messages = data && data.messages || {};
			onComplete( error, messages );
		};
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

	needsOnlyGoogleAppsDetails() {
		return cartItems.hasGoogleApps( this.props.cart ) && ! cartItems.hasDomainRegistration( this.props.cart );
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

			if ( ! formState.getFieldValue( this.state.form, 'phone' ) ) {
				this.setState( {
					phoneCountryCode: event.target.value
				} );
			}
		}

		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: event.target.value
		} );
	},

	handlePhoneChange( { value, countryCode } ) {
		this.formStateController.handleFieldChange( {
			name: 'phone',
			value
		} );

		this.setState( {
			phoneCountryCode: countryCode
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
			value: formState.getFieldValue( this.state.form, name ) || '',
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

	renderNameFields() {
		return (
			<div>
				<Input
					autoFocus
					label={ this.translate( 'First Name') }
					{ ...this.getFieldProps( 'first-name' ) } />

				<Input label={ this.translate( 'Last Name' ) } { ...this.getFieldProps( 'last-name' ) } />
			</div>
		);
	},

	renderOrganizationField() {
		return <HiddenInput
			label={ this.translate( 'Organization' ) }
			text={ this.translate(
				'Registering this domain for a company? + Add Organization Name',
				'Registering these domains for a company? + Add Organization Name',
				{
					context: 'Domain contact information page',
					comment: 'Count specifies the number of domain registrations',
					count: this.getNumberOfDomainRegistrations()
				}
			) }
			{ ...this.getFieldProps( 'organization' ) } />;
	},

	renderEmailField() {
		return (
			<Input label={ this.translate( 'Email' ) } { ...this.getFieldProps( 'email' ) } />
		);
	},

	renderCountryField() {
		return (
			<CountrySelect
				label={ this.translate( 'Country' ) }
				countriesList={ countriesList }
				{ ...this.getFieldProps( 'country-code' ) } />
		);
	},

	renderFaxField() {
		return (
			<Input label={ this.translate( 'Fax' ) } { ...this.getFieldProps( 'fax' ) } />
		);
	},

	renderPhoneField() {
		const label = this.translate( 'Phone' );

		return (
			<FormPhoneMediaInput
				label={ label }
				countriesList={ countriesList }
				countryCode={ this.state.phoneCountryCode }
				onChange={ this.handlePhoneChange }
				{ ...omit( this.getFieldProps( 'phone' ), 'onChange' ) } />
		);
	},

	renderAddressFields() {
		return (
			<div>
				<Input label={ this.translate( 'Address' ) } maxLength={ 40 } { ...this.getFieldProps( 'address-1' ) }/>

				<HiddenInput
					label={ this.translate( 'Address Line 2' ) }
					text={ this.translate( '+ Add Address Line 2' ) }
					maxLength={ 40 }
					{ ...this.getFieldProps( 'address-2' ) } />
			</div>
		);
	},

	renderCityField() {
		return (
			<Input label={ this.translate( 'City' ) } { ...this.getFieldProps( 'city' ) } />
		);
	},

	renderStateField() {
		const countryCode = formState.getFieldValue( this.state.form, 'countryCode' );

		return <StateSelect
			label={ this.translate( 'State' ) }
			countryCode={ countryCode }
			{ ...this.getFieldProps( 'state' ) } />;
	},

	renderPostalCodeField() {
		return (
			<Input label={ this.translate( 'Postal Code' ) } { ...this.getFieldProps( 'postal-code' ) } />
		);
	},

	renderDetailsForm() {
		const needsOnlyGoogleAppsDetails = this.needsOnlyGoogleAppsDetails();

		return (
			<form>
				{ this.renderNameFields() }
				{ ! needsOnlyGoogleAppsDetails && this.renderOrganizationField() }
				{ ! needsOnlyGoogleAppsDetails && this.renderEmailField() }
				{ ! needsOnlyGoogleAppsDetails && this.renderPhoneField() }
				{ this.renderCountryField() }
				{ ! needsOnlyGoogleAppsDetails && this.needsFax() && this.renderFaxField() }
				{ ! needsOnlyGoogleAppsDetails && this.renderAddressFields() }
				{ ! needsOnlyGoogleAppsDetails && this.renderCityField() }
				{ ! needsOnlyGoogleAppsDetails && this.renderStateField() }
				{ this.renderPostalCodeField() }

				{ this.renderSubmitButton() }
			</form>
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
		const errors = formState.getErrorMessages( this.state.form ),
			tracksEventObject = reduce(
				formState.getErrorMessages( this.state.form ),
				( result, value, key ) => {
					result[ `error_${ key }` ] = value;
					return result;
				},
				{
					errors_count: errors && errors.length || 0,
					submission_count: this.state.submissionCount + 1
				}
			);

		analytics.tracks.recordEvent( 'calypso_contact_information_form_submit', tracksEventObject );
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

		const allFieldValues = Object.assign( {}, formState.getAllFieldValues( this.state.form ) );
		allFieldValues.phone = toIcannFormat( allFieldValues.phone, countries[ this.state.phoneCountryCode ] );
		setDomainDetails( allFieldValues );
		addGoogleAppsRegistrationData( allFieldValues );
	},

	setPrivacyProtectionSubscriptions( enable ) {
		if ( enable ) {
			addPrivacyToAllDomains();
		} else {
			removePrivacyFromAllDomains();
		}
	},

	render() {
		const needsOnlyGoogleAppsDetails = this.needsOnlyGoogleAppsDetails(),
			classSet = classNames( {
				'domain-details': true,
				selected: true,
				'only-google-apps-details': needsOnlyGoogleAppsDetails
			} ),
			titleOptions = {
				context: 'Domain contact information page'
			};

		let title;
		if ( needsOnlyGoogleAppsDetails ) {
			title = this.translate( 'G Suite Account Information', titleOptions );
		} else {
			title = this.translate( 'Domain Contact Information', titleOptions );
		}

		return (
			<div>
				{ cartItems.hasDomainRegistration( this.props.cart ) && this.renderPrivacySection() }
				<PaymentBox
					classSet={ classSet }
					title={ title }>
					{ this.renderDetailsForm() }
				</PaymentBox>
			</div>
		);
	}
} );
