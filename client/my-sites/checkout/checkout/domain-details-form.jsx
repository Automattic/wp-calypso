/**
 * External dependencies
 */
import classNames from 'classnames';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import { camelCase, deburr, first, head, includes, indexOf, intersection, isEqual, kebabCase, last, map, omit, pick, reduce } from 'lodash';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PaymentBox from './payment-box';
import PrivacyProtection from './privacy-protection';
import SecurePaymentFormPlaceholder from './secure-payment-form-placeholder.jsx';
import QueryContactDetailsCache from 'components/data/query-contact-details-cache';
import ExtraInfoForm, { tldsWithAdditionalDetailsForms } from 'components/domains/registrant-extra-info';
import FormButton from 'components/forms/form-button';
import FormPhoneMediaInput from 'components/forms/form-phone-media-input';
import { countries } from 'components/phone-input/data';
import { toIcannFormat } from 'components/phone-input/phone-number';
import config from 'config';
import { abtest } from 'lib/abtest';
import analytics from 'lib/analytics';
import { cartItems } from 'lib/cart-values';
import { forDomainRegistrations as countriesListForDomainRegistrations } from 'lib/countries-list';
import formState from 'lib/form-state';
import { addPrivacyToAllDomains, removePrivacyFromAllDomains, setDomainDetails, addGoogleAppsRegistrationData } from 'lib/upgrades/actions';
import wp from 'lib/wp';
import { CountrySelect, StateSelect, Input, HiddenInput } from 'my-sites/domains/components/form';
import { updateContactDetailsCache } from 'state/domains/management/actions';
import { getContactDetailsCache } from 'state/selectors';

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

		const steps = [
			'mainForm',
			...this.getRequiredExtraSteps(),
		];
		debug( 'steps:', steps );

		this.state = {
			form: null,
			isDialogVisible: false,
			submissionCount: 0,
			phoneCountryCode: 'US',
			steps,
			currentStep: first( steps ),
		};

		this.inputRefs = {};
		this.inputRefCallbacks = {};
	}

	componentWillMount() {
		this.formStateController = formState.Controller( {
			fieldNames: this.fieldNames,
			loadFunction: this.loadFormStateFromRedux,
			sanitizerFunction: this.sanitize,
			validatorFunction: this.validate,
			onNewState: this.setFormState,
			onError: this.handleFormControllerError,
		} );
	}

	componentDidMount() {
		analytics.pageView.record( '/checkout/domain-contact-information', 'Checkout > Domain Contact Information' );
	}

	componentDidUpdate( prevProps, prevState ) {
		const previousFormValues = formState.getAllFieldValues( prevState.form );
		const currentFormValues = formState.getAllFieldValues( this.state.form );
		if ( ! isEqual( previousFormValues, currentFormValues ) ) {
			this.props.updateContactDetailsCache( this.getMainFieldValues() );
		}
	}

	loadFormStateFromRedux = ( fn ) => {
		// only load the properties relevant to the main form fields
		fn( null, pick( this.props.contactDetails, this.fieldNames ) );
	};

	sanitize = ( fieldValues, onComplete ) => {
		const sanitizedFieldValues = Object.assign( {}, fieldValues );
		this.fieldNames.forEach( ( fieldName ) => {
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

	hasAnotherStep() {
		return this.state.currentStep !== last( this.state.steps );
	}

	switchToNextStep() {
		const newStep = this.state.steps[ indexOf( this.state.steps, this.state.currentStep ) + 1 ];
		debug( 'Switching to step: ' + newStep );
		this.setState( { currentStep: newStep } );
	}

	validate = ( fieldValues, onComplete ) => {
		if ( this.needsOnlyGoogleAppsDetails() ) {
			wpcom.validateGoogleAppsContactInformation( fieldValues, this.generateValidationHandler( onComplete ) );
			return;
		}

		const allFieldValues = this.getMainFieldValues();
		const domainNames = map( cartItems.getDomainRegistrations( this.props.cart ), 'meta' );
		wpcom.validateDomainContactInformation( allFieldValues, domainNames, this.generateValidationHandler( onComplete ) );
	};

	generateValidationHandler( onComplete ) {
		return ( error, data ) => {
			const messages = data && data.messages || {};
			onComplete( error, messages );
		};
	}

	setFormState = ( form ) => {
		if ( ! this.needsFax() ) {
			delete form.fax;
		}

		this.setState( { form } );
	};

	needsOnlyGoogleAppsDetails() {
		return cartItems.hasGoogleApps( this.props.cart ) && ! cartItems.hasDomainRegistration( this.props.cart );
	}

	handleFormControllerError = ( error ) => {
		throw error;
	};

	handleChangeEvent = ( event ) => {
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
	};

	handlePhoneChange = ( { value, countryCode } ) => {
		this.formStateController.handleFieldChange( {
			name: 'phone',
			value
		} );

		this.setState( {
			phoneCountryCode: countryCode
		} );
	};

	getMainFieldValues() {
		const mainFieldValues = formState.getAllFieldValues( this.state.form );
		return {
			...mainFieldValues,
			phone: toIcannFormat( mainFieldValues.phone, countries[ this.state.phoneCountryCode ] ),
		};
	}

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
		const ref = name === 'state'
			? { inputRef: this.getInputRefCallback( name ) }
			: { ref: name };
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
			errorMessage: ( formState.getFieldErrorMessages( this.state.form, camelCase( name ) ) || [] ).join( '\n' ),
			eventFormName: 'Checkout Form',
		};
	}

	needsFax() {
		return this.props.contactDetails.countryCode === 'NL' && cartItems.hasTld( this.props.cart, 'nl' );
	}

	allDomainRegistrationsSupportPrivacy() {
		return cartItems.hasOnlyDomainRegistrationsWithPrivacySupport( this.props.cart );
	}

	allDomainRegistrationsHavePrivacy() {
		return cartItems.getDomainRegistrationsWithoutPrivacy( this.props.cart ).length === 0;
	}

	renderSubmitButton() {
		const continueText = this.hasAnotherStep()
			? this.props.translate( 'Continue' )
			: this.props.translate( 'Continue to Checkout' );

		return (
			<FormButton className="checkout__domain-details-form-submit-button" onClick={ this.handleSubmitButtonClick }>
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
				isChecked={ this.allDomainRegistrationsHavePrivacy() }
				onCheckboxChange={ this.handleCheckboxChange }
				onRadioSelect={ this.handleRadioChange }
				onDialogClose={ this.closeDialog }
				onDialogOpen={ this.openDialog }
				onDialogSelect={ this.handlePrivacyDialogSelect }
				isDialogVisible={ this.state.isDialogVisible }
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
					{ ...this.getFieldProps( 'first-name' ) } />

				<Input label={ this.props.translate( 'Last Name' ) } { ...this.getFieldProps( 'last-name' ) } />
			</div>
		);
	}

	renderOrganizationField() {
		return <HiddenInput
			label={ this.props.translate( 'Organization' ) }
			text={ this.props.translate(
				'Registering this domain for a company? + Add Organization Name',
				'Registering these domains for a company? + Add Organization Name',
				{
					count: this.getNumberOfDomainRegistrations(),
				}
			) }
			{ ...this.getFieldProps( 'organization' ) } />;
	}

	renderEmailField() {
		return (
			<Input label={ this.props.translate( 'Email' ) } { ...this.getFieldProps( 'email' ) } />
		);
	}

	renderCountryField() {
		return (
			<CountrySelect
				label={ this.props.translate( 'Country' ) }
				countriesList={ countriesList }
				{ ...this.getFieldProps( 'country-code' ) } />
		);
	}

	renderFaxField() {
		return (
			<Input label={ this.props.translate( 'Fax' ) } { ...this.getFieldProps( 'fax' ) } />
		);
	}

	renderPhoneField() {
		const label = this.props.translate( 'Phone' );

		return (
			<FormPhoneMediaInput
				label={ label }
				countriesList={ countriesList }
				countryCode={ this.state.phoneCountryCode }
				onChange={ this.handlePhoneChange }
				{ ...omit( this.getFieldProps( 'phone' ), 'onChange' ) } />
		);
	}

	renderAddressFields() {
		return (
			<div>
				<Input label={ this.props.translate( 'Address' ) } maxLength={ 40 } { ...this.getFieldProps( 'address-1' ) } />

				<HiddenInput
					label={ this.props.translate( 'Address Line 2' ) }
					text={ this.props.translate( '+ Add Address Line 2' ) }
					maxLength={ 40 }
					{ ...this.getFieldProps( 'address-2' ) } />
			</div>
		);
	}

	renderCityField() {
		return (
			<Input label={ this.props.translate( 'City' ) } { ...this.getFieldProps( 'city' ) } />
		);
	}

	renderStateField() {
		const countryCode = formState.getFieldValue( this.state.form, 'countryCode' );

		return <StateSelect
			label={ this.props.translate( 'State' ) }
			countryCode={ countryCode }
			{ ...this.getFieldProps( 'state' ) } />;
	}

	renderPostalCodeField() {
		return (
			<Input label={ this.props.translate( 'Postal Code' ) } { ...this.getFieldProps( 'postal-code' ) } />
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
				{ ! needsOnlyGoogleAppsDetails && this.renderAddressFields() }
				{ ! needsOnlyGoogleAppsDetails && this.renderCityField() }
				{ ! needsOnlyGoogleAppsDetails && this.renderStateField() }
				{ this.renderPostalCodeField() }

				{ this.renderSubmitButton() }
			</form>
		);
	}

	renderExtraDetailsForm( tld ) {
		return (
			<ExtraInfoForm tld={ tld } >
				{ this.renderSubmitButton() }
			</ExtraInfoForm>
		);
	}

	handleCheckboxChange = () => {
		this.setPrivacyProtectionSubscriptions( ! this.allDomainRegistrationsHavePrivacy() );
	};

	handleRadioChange = ( enable ) => {
		this.setPrivacyProtectionSubscriptions( enable );
	};

	closeDialog = () => {
		this.setState( { isDialogVisible: false } );
	};

	openDialog = () => {
		this.setState( { isDialogVisible: true } );
	};

	focusFirstError() {
		const firstErrorName = kebabCase( head( formState.getInvalidFields( this.state.form ) ).name );
		const firstErrorRef = this.inputRefs[ firstErrorName ] || this.refs[ firstErrorName ];
		firstErrorRef.focus();
	}

	handleSubmitButtonClick = ( event ) => {
		event.preventDefault();

		this.formStateController.handleSubmit( ( hasErrors ) => {
			this.recordSubmit();

			if ( hasErrors ) {
				this.focusFirstError();
				return;
			}

			if ( this.hasAnotherStep() ) {
				return this.switchToNextStep();
			}

			if ( this.allDomainRegistrationsSupportPrivacy() &&
				! this.allDomainRegistrationsHavePrivacy() &&
				abtest( 'privacyNoPopup' ) !== 'nopopup' ) {
				this.openDialog();
				return;
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
					errors_count: errors && errors.length || 0,
					submission_count: this.state.submissionCount + 1
				}
			);

		analytics.tracks.recordEvent( 'calypso_contact_information_form_submit', tracksEventObject );
		this.setState( { submissionCount: this.state.submissionCount + 1 } );
	}

	handlePrivacyDialogSelect = ( options ) => {
		this.formStateController.handleSubmit( ( hasErrors ) => {
			this.recordSubmit();

			this.setPrivacyProtectionSubscriptions( options.addPrivacy !== false );

			if ( hasErrors || options.skipFinish ) {
				this.closeDialog();
				return;
			}

			this.finish();
		} );
	};

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
			this.inputRefCallbacks[ name ] =
				( el ) => this.inputRefs[ name ] = el;
		}

		return this.inputRefCallbacks[ name ];
	}

	renderCurrentForm() {
		const { currentStep } = this.state;
		return includes( tldsWithAdditionalDetailsForms, currentStep )
			? this.renderExtraDetailsForm( this.state.currentStep )
			: this.renderDetailsForm();
	}

	render() {
		const needsOnlyGoogleAppsDetails = this.needsOnlyGoogleAppsDetails(),
			classSet = classNames( {
				'domain-details': true,
				selected: true,
				'only-google-apps-details': needsOnlyGoogleAppsDetails
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
				{
					cartItems.hasDomainRegistration( this.props.cart ) &&
					this.allDomainRegistrationsSupportPrivacy() &&
					this.renderPrivacySection()
				}
				<PaymentBox
					currentPage={ this.state.currentStep }
					classSet={ classSet }
					title={ title }>
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
				{
					this.props.contactDetails
						? <DomainDetailsForm { ...this.props } />
						: <SecurePaymentFormPlaceholder />
				}
			</div>
		);
	}
}

export default connect(
	state => ( { contactDetails: getContactDetailsCache( state ) } ),
	{ updateContactDetailsCache }
)( localize( DomainDetailsFormContainer ) );
