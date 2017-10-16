/*eslint-disable*/
/*




Notes:




 */
/**
 * External dependencies
 *
 * @format
 */

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import debugFactory from 'debug';
import {
	camelCase,
	deburr,
	first,
	head,
	includes,
	indexOf,
	intersection,
	isEqual,
	kebabCase,
	last,
	map,
	omit,
	pick,
	reduce,
} from 'lodash';

/**
 * Internal dependencies
 */
import { getContactDetailsCache } from 'state/selectors';
import { updateContactDetailsCache } from 'state/domains/management/actions';
import QueryContactDetailsCache from 'components/data/query-contact-details-cache';
import { CountrySelect, StateSelect, Input, HiddenInput } from 'my-sites/domains/components/form';
import PrivacyProtection from './privacy-protection';
import PaymentBox from './payment-box';
import { cartItems } from 'lib/cart-values';
import { forDomainRegistrations as countriesListForDomainRegistrations } from 'lib/countries-list';
import analytics from 'lib/analytics';
import formState from 'lib/form-state';
import {
	addPrivacyToAllDomains,
	removePrivacyFromAllDomains,
	setDomainDetails,
	addGoogleAppsRegistrationData,
} from 'lib/upgrades/actions';
import FormButton from 'components/forms/form-button';
import { countries } from 'components/phone-input/data';
import { toIcannFormat } from 'components/phone-input/phone-number';
import FormPhoneMediaInput from 'components/forms/form-phone-media-input';
import SecurePaymentFormPlaceholder from './secure-payment-form-placeholder.jsx';
import wp from 'lib/wp';
import ExtraInfoForm, {
	tldsWithAdditionalDetailsForms,
} from 'components/domains/registrant-extra-info';
import config from 'config';
// new component
import ContactDetailsFormFields from 'components/contact-details-form-fields';

const debug = debugFactory( 'calypso:my-sites:upgrades:checkout:domain-details' );
const wpcom = wp.undocumented(),
	countriesList = countriesListForDomainRegistrations();

export class DomainDetailsForm extends PureComponent {
	constructor( props, context ) {
		super( props, context );

		this.fieldNames = [
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
			'fax',
		];

		const steps = [ 'mainForm', ...this.getRequiredExtraSteps() ];
		debug( 'steps:', steps );

		this.state = {
			form: null,
			submissionCount: 0,
			phoneCountryCode: 'US',
			steps,
			currentStep: first( steps ),
		};

		this.inputRefs = {};
		this.inputRefCallbacks = {};
	}

	componentWillMount() {
		// eslint-disable-next-line
		console.log( 'componentWillMount() this.props.contactDetails ', this.props.contactDetails );

		const initialFields = pick( this.props.contactDetails, this.fieldNames );
		this.formStateController = formState.Controller( {
			//fieldNames: this.fieldNames,
			initialFields,
			//loadFunction: this.loadFormStateFromRedux,
			sanitizerFunction: this.sanitize,
			validatorFunction: this.validate,
			onNewState: this.setFormState,
			onError: this.handleFormControllerError,
		} );

		// eslint-disable-next-line
		console.log( 'componentWillMount() this.state ', this.formStateController.getInitialState() );
		this.setState( {
			form: this.formStateController.getInitialState(),
		} );
	}

	componentDidMount() {
		analytics.pageView.record(
			'/checkout/domain-contact-information',
			'Checkout > Domain Contact Information'
		);
	}

	componentDidUpdate( prevProps, prevState ) {
		const previousFormValues = formState.getAllFieldValues( prevState.form );
		const currentFormValues = formState.getAllFieldValues( this.state.form );
		// eslint-disable-next-line
		console.log( 'this.getMainFieldValues()', this.getMainFieldValues() );
		if ( ! isEqual( previousFormValues, currentFormValues ) ) {
			this.props.updateContactDetailsCache( this.getMainFieldValues() );
		}
	}

	// loadFormStateFromRedux = fn => {
	// 	// only load the properties relevant to the main form fields
	// 	fn( null, pick( this.props.contactDetails, this.fieldNames ) );
	// };

	validate = ( fieldValues, onComplete ) => {
		if ( this.needsOnlyGoogleAppsDetails() ) {
			wpcom.validateGoogleAppsContactInformation(
				fieldValues,
				this.generateValidationHandler( onComplete )
			);
			return;
		}

		const allFieldValues = this.getMainFieldValues();
		const domainNames = map( cartItems.getDomainRegistrations( this.props.cart ), 'meta' );
		wpcom.validateDomainContactInformation(
			allFieldValues,
			domainNames,
			this.generateValidationHandler( onComplete )
		);
	};

	sanitize = ( fieldValues, onComplete ) => {
		const sanitizedFieldValues = Object.assign( {}, fieldValues );
		this.fieldNames.forEach( fieldName => {
			if ( typeof fieldValues[ fieldName ] === 'string' ) {
				// TODO: Deep
				sanitizedFieldValues[ fieldName ] = deburr( fieldValues[ fieldName ].trim() );
				if ( fieldName === 'postalCode' ) {
					sanitizedFieldValues[ fieldName ] = sanitizedFieldValues[ fieldName ].toUpperCase();
				}
			}
		} );

		onComplete( sanitizedFieldValues );
	};

	setFormState = form => {
		if ( ! this.needsFax() ) {
			delete form.fax;
		}

		this.setState( { form } );
	};

	hasAnotherStep() {
		return this.state.currentStep !== last( this.state.steps );
	}

	switchToNextStep() {
		const newStep = this.state.steps[ indexOf( this.state.steps, this.state.currentStep ) + 1 ];
		debug( 'Switching to step: ' + newStep );
		this.setState( { currentStep: newStep } );
	}

	generateValidationHandler( onComplete ) {
		return ( error, data ) => {
			const messages = ( data && data.messages ) || {};
			onComplete( error, messages );
		};
	}

	needsOnlyGoogleAppsDetails() {
		return (
			cartItems.hasGoogleApps( this.props.cart ) &&
			! cartItems.hasDomainRegistration( this.props.cart )
		);
	}

	handleFormControllerError = error => {
		throw error;
	};

	handleChangeEvent = event => {
		// Resets the state field every time the user selects a different country
		if ( event.target.name === 'country-code' ) {
			this.formStateController.handleFieldChange( {
				name: 'state',
				value: '',
				hideError: true,
			} );

			if ( ! formState.getFieldValue( this.state.form, 'phone' ) ) {
				this.setState( {
					phoneCountryCode: event.target.value,
				} );
			}
		}

		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: event.target.value,
		} );
	};

	handlePhoneChange = ( { value, countryCode } ) => {
		this.formStateController.handleFieldChange( {
			name: 'phone',
			value,
		} );

		this.setState( {
			phoneCountryCode: countryCode,
		} );
	};

	getMainFieldValues() {
		const mainFieldValues = formState.getAllFieldValues( this.state.form );
		return {
			...mainFieldValues,
			phone: toIcannFormat( mainFieldValues.phone, countries[ this.state.phoneCountryCode ] ),
		};
	}

	// if `domains/cctlds` is `true` in the config,
	// for every domain that requires additional steps, add it to this.state.steps
	getRequiredExtraSteps() {
		if ( ! config.isEnabled( 'domains/cctlds' ) ) {
			// All we need to do to disable everything is not show the .FR form
			return [];
		}
		return intersection( cartItems.getTlds( this.props.cart ), tldsWithAdditionalDetailsForms );
	}

	getNumberOfDomainRegistrations() {
		return cartItems.getDomainRegistrations( this.props.cart ).length;
	}

	getFieldProps( name ) {
		const ref = name === 'state' ? { inputRef: this.getInputRefCallback( name ) } : { ref: name };
		return {
			name,
			...ref,
			additionalClasses: 'checkout-field',
			value: formState.getFieldValue( this.state.form, name ) || '',
			isError: formState.isFieldInvalid( this.state.form, name ),
			disabled: formState.isFieldDisabled( this.state.form, name ),
			onChange: this.handleChangeEvent,
			// The keys are mapped to snake_case when going to API and camelCase when the response is parsed and we are using
			// kebab-case for HTML, so instead of using different variations all over the place, this accepts kebab-case and
			// converts it to camelCase which is the format stored in the formState.
			errorMessage: ( formState.getFieldErrorMessages( this.state.form, camelCase( name ) ) || [] )
				.join( '\n' ),
			eventFormName: 'Checkout Form',
		};
	}

	needsFax() {
		return (
			this.props.contactDetails.countryCode === 'NL' && cartItems.hasTld( this.props.cart, 'nl' )
		);
	}

	allDomainRegistrationsSupportPrivacy() {
		return cartItems.hasOnlyDomainRegistrationsWithPrivacySupport( this.props.cart );
	}

	allDomainRegistrationsHavePrivacy() {
		return cartItems.getDomainRegistrationsWithoutPrivacy( this.props.cart ).length === 0;
	}

	shouldDisplayAddressFieldset() {
		const { contactDetails } = this.props;
		return !! ( contactDetails || {} ).countryCode;
	}

	renderSubmitButton() {
		const continueText = this.hasAnotherStep()
			? this.props.translate( 'Continue' )
			: this.props.translate( 'Continue to Checkout' );

		return (
			<FormButton
				className="checkout__domain-details-form-submit-button"
				onClick={ this.handleSubmitButtonClick }
			>
				{ continueText }
			</FormButton>
		);
	}

	renderPrivacySection() {
		return (
			<PrivacyProtection
				allDomainsHavePrivacy={ this.allDomainRegistrationsHavePrivacy() }
				cart={ this.props.cart }
				countriesList={ countriesList }
				disabled={ formState.isSubmitButtonDisabled( this.state.form ) }
				fields={ this.state.form }
				onCheckboxChange={ this.handleCheckboxChange }
				onRadioSelect={ this.handleRadioChange }
				productsList={ this.props.productsList }
			/>
		);
	}

	renderNameFields() {
		return (
			<div>
				<Input
					autoFocus
					label={ this.props.translate( 'First Name' ) }
					{ ...this.getFieldProps( 'first-name' ) }
				/>

				<Input
					label={ this.props.translate( 'Last Name' ) }
					{ ...this.getFieldProps( 'last-name' ) }
				/>
			</div>
		);
	}

	renderOrganizationField() {
		return (
			<HiddenInput
				label={ this.props.translate( 'Organization' ) }
				text={ this.props.translate(
					'Registering this domain for a company? + Add Organization Name',
					'Registering these domains for a company? + Add Organization Name',
					{
						count: this.getNumberOfDomainRegistrations(),
					}
				) }
				{ ...this.getFieldProps( 'organization' ) }
			/>
		);
	}

	renderEmailField() {
		return <Input label={ this.props.translate( 'Email' ) } { ...this.getFieldProps( 'email' ) } />;
	}

	renderCountryField() {
		return (
			<CountrySelect
				label={ this.props.translate( 'Country' ) }
				countriesList={ countriesList }
				{ ...this.getFieldProps( 'country-code' ) }
			/>
		);
	}

	renderFaxField() {
		return <Input label={ this.props.translate( 'Fax' ) } { ...this.getFieldProps( 'fax' ) } />;
	}

	renderPhoneField() {
		const label = this.props.translate( 'Phone' );

		return (
			<FormPhoneMediaInput
				label={ label }
				countriesList={ countriesList }
				countryCode={ this.state.phoneCountryCode }
				onChange={ this.handlePhoneChange }
				{ ...omit( this.getFieldProps( 'phone' ), 'onChange' ) }
			/>
		);
	}

	renderAddressFields() {
		return (
			<div>
				<Input
					label={ this.props.translate( 'Address' ) }
					maxLength={ 40 }
					{ ...this.getFieldProps( 'address-1' ) }
				/>

				<HiddenInput
					label={ this.props.translate( 'Address Line 2' ) }
					text={ this.props.translate( '+ Add Address Line 2' ) }
					maxLength={ 40 }
					{ ...this.getFieldProps( 'address-2' ) }
				/>
			</div>
		);
	}

	renderCityField() {
		return <Input label={ this.props.translate( 'City' ) } { ...this.getFieldProps( 'city' ) } />;
	}

	renderStateField() {
		const countryCode = formState.getFieldValue( this.state.form, 'countryCode' );

		return (
			<StateSelect
				label={ this.props.translate( 'State' ) }
				countryCode={ countryCode }
				{ ...this.getFieldProps( 'state' ) }
			/>
		);
	}

	renderPostalCodeField() {
		return (
			<Input
				label={ this.props.translate( 'Postal Code' ) }
				{ ...this.getFieldProps( 'postal-code' ) }
			/>
		);
	}

	renderCountryDependentAddressFields( needsOnlyGoogleAppsDetails ) {
		return (
			<div className="checkout__domain-details-country-dependent-address-fields">
				{ ! needsOnlyGoogleAppsDetails && this.renderAddressFields() }
				{ ! needsOnlyGoogleAppsDetails && this.renderCityField() }
				{ ! needsOnlyGoogleAppsDetails && this.renderStateField() }
				{ this.renderPostalCodeField() }
			</div>
		);
	}

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
				{ this.shouldDisplayAddressFieldset() &&
					this.renderCountryDependentAddressFields( needsOnlyGoogleAppsDetails ) }
				{ this.renderSubmitButton() }
			</form>
		);
	}

	renderExtraDetailsForm( tld ) {
		return <ExtraInfoForm tld={ tld }>{ this.renderSubmitButton() }</ExtraInfoForm>;
	}

	handleRadioChange = enable => {
		this.setPrivacyProtectionSubscriptions( enable );
	};

	focusFirstError() {
		const firstErrorName = kebabCase( head( formState.getInvalidFields( this.state.form ) ).name );
		const firstErrorRef = this.inputRefs[ firstErrorName ] || this.refs[ firstErrorName ];
		firstErrorRef.focus();
	}

	handleSubmitButtonClick = event => {
		event.preventDefault();

		this.formStateController.handleSubmit( hasErrors => {
			this.recordSubmit();

			if ( hasErrors ) {
				this.focusFirstError();
				return;
			}

			if ( this.hasAnotherStep() ) {
				return this.switchToNextStep();
			}

			this.finish();
		} );
	};

	recordSubmit() {
		const errors = formState.getErrorMessages( this.state.form ),
			tracksEventObject = reduce(
				formState.getErrorMessages( this.state.form ),
				( result, value, key ) => {
					result[ `error_${ key }` ] = value;
					return result;
				},
				{
					errors_count: ( errors && errors.length ) || 0,
					submission_count: this.state.submissionCount + 1,
				}
			);

		analytics.tracks.recordEvent( 'calypso_contact_information_form_submit', tracksEventObject );
		this.setState( { submissionCount: this.state.submissionCount + 1 } );
	}

	finish() {
		const allFieldValues = this.props.contactDetails;
		debug( 'finish: allFieldValues:', allFieldValues );
		setDomainDetails( allFieldValues );
		addGoogleAppsRegistrationData( allFieldValues );
	}

	setPrivacyProtectionSubscriptions( enable ) {
		if ( enable ) {
			addPrivacyToAllDomains();
		} else {
			removePrivacyFromAllDomains();
		}
	}

	// We want to cache the functions to avoid triggering unecessary rerenders
	getInputRefCallback( name ) {
		if ( ! this.inputRefCallbacks[ name ] ) {
			this.inputRefCallbacks[ name ] = el => ( this.inputRefs[ name ] = el );
		}

		return this.inputRefCallbacks[ name ];
	}

	// new component methods
	handleFieldChange = ( { name, value, hideError, ...fieldProps } ) => {
		// eslint-disable-next-line
		console.log( 'handleFieldChange', name, value, hideError, fieldProps );
		this.formStateController.handleFieldChange( {
			name,
			value,
			hideError,
		} );
		// temp
		if ( fieldProps.phoneCountryCode ) {
			this.setState( {
				phoneCountryCode: fieldProps.phoneCountryCode,
			} );
		}
	};

	isFieldDisabled = fieldName => {
		return formState.isFieldDisabled( this.state.form, fieldName );
	};

	isFieldInvalid = fieldName => {
		return formState.isFieldInvalid( this.state.form, fieldName );
	};

	getFieldValue = fieldName => {
		return formState.getFieldValue( this.state.form, fieldName ) || '';
	};

	getFieldErrorMessages = fieldName => {
		// The keys are mapped to snake_case when going to API and camelCase when the response is parsed and we are using
		// kebab-case for HTML, so instead of using different variations all over the place, this accepts kebab-case and
		// converts it to camelCase which is the format stored in the formState.
		return ( formState.getFieldErrorMessages( this.state.form, camelCase( fieldName ) ) || [] )
			.join( '\n' );
	};

	renderCurrentForm() {
		const { currentStep } = this.state;
		// eslint-disable-next-line
		console.log(
			'render() tldsWithAdditionalDetailsForms',
			tldsWithAdditionalDetailsForms,
			currentStep
		);
		return includes( tldsWithAdditionalDetailsForms, currentStep ) ? (
			this.renderExtraDetailsForm( this.state.currentStep )
		) : (
			// : this.renderDetailsForm();
			<ContactDetailsFormFields
				contactDetails={ this.props.contactDetails }
				countriesList={ countriesList }
				eventFormName="Checkout Form"
				isFieldDisabled={ this.isFieldDisabled }
				onFieldChange={ this.handleFieldChange }
			/>
		);
	}

	render() {
		const needsOnlyGoogleAppsDetails = this.needsOnlyGoogleAppsDetails(),
			classSet = classNames( {
				'domain-details': true,
				selected: true,
				'only-google-apps-details': needsOnlyGoogleAppsDetails,
			} );

		let title;
		// TODO: gather up tld specific stuff
		if ( this.state.currentStep === 'fr' ) {
			title = this.props.translate( '.FR Registration' );
		} else if ( needsOnlyGoogleAppsDetails ) {
			title = this.props.translate( 'G Suite Account Information' );
		} else {
			title = this.props.translate( 'Domain Contact Information' );
		}

		return (
			<div>
				{ cartItems.hasDomainRegistration( this.props.cart ) &&
					this.allDomainRegistrationsSupportPrivacy() &&
					this.renderPrivacySection() }
				<PaymentBox currentPage={ this.state.currentStep } classSet={ classSet } title={ title }>
					{ this.renderCurrentForm() }
				</PaymentBox>
			</div>
		);
	}
}

export class DomainDetailsFormContainer extends PureComponent {
	render() {
		return (
			<div>
				<QueryContactDetailsCache />
				{ this.props.contactDetails ? (
					<DomainDetailsForm { ...this.props } />
				) : (
					<SecurePaymentFormPlaceholder />
				) }
			</div>
		);
	}
}

export default connect( state => ( { contactDetails: getContactDetailsCache( state ) } ), {
	updateContactDetailsCache,
} )( localize( DomainDetailsFormContainer ) );
