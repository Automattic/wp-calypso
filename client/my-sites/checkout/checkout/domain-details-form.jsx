/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import debugFactory from 'debug';
import {
	deburr,
	debounce,
	first,
	flatten,
	includes,
	indexOf,
	intersection,
	isEmpty,
	isEqual,
	last,
	map,
	omit,
	pick,
	reduce,
} from 'lodash';

/**
 * Internal dependencies
 */
import { getContactDetailsCache, getDomainContactValidationMessages } from 'state/selectors';
import { getCountryStates } from 'state/country-states/selectors';
import { updateContactDetailsCache, fetchDomainContactValidation, fetchGAppsValidation } from 'state/domains/management/actions';
import QueryContactDetailsCache from 'components/data/query-contact-details-cache';
import { CountrySelect, Input, HiddenInput } from 'my-sites/domains/components/form';
import PrivacyProtection from './privacy-protection';
import PaymentBox from './payment-box';
import { cartItems } from 'lib/cart-values';
import { forDomainRegistrations as countriesList } from 'lib/countries-list';
import analytics from 'lib/analytics';
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
import ExtraInfoForm, {
	tldsWithAdditionalDetailsForms,
} from 'components/domains/registrant-extra-info';
import config from 'config';
import GAppsFieldset from 'my-sites/domains/components/domain-form-fieldsets/g-apps-fieldset';
import RegionAddressFieldsets from 'my-sites/domains/components/domain-form-fieldsets/region-address-fieldsets';

const debug = debugFactory( 'calypso:my-sites:upgrades:checkout:domain-details' );

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
			form: pick( props.contactDetails, this.fieldNames ),
			submissionCount: 0,
			phoneCountryCode: 'US',
			steps,
			currentStep: first( steps ),
		};

		this.inputRefs = {};
		this.inputRefCallbacks = {};
		this.shouldAutoFocusAddressField = false;
		this.validate = debounce( this.validate, 333 );
	}

	componentDidMount() {
		if ( analytics ) {
			analytics.pageView.record(
				'/checkout/domain-contact-information',
				'Checkout > Domain Contact Information'
			);
		}
		this.validate();
	}

	componentDidUpdate( prevProps, prevState ) {
		if ( ! isEqual( prevState.form, this.state.form ) ) {
			this.props.updateContactDetailsCache( this.getMainFieldValues() );
			this.validate();
		}

		if ( ! isEqual( prevProps.cart, this.props.cart ) ) {
			this.validateSteps();
		}
	}

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

	hasAnotherStep() {
		return this.state.currentStep !== last( this.state.steps );
	}

	validateSteps() {
		const updatedSteps = [ 'mainForm', ...this.getRequiredExtraSteps() ];
		const newState = {
			steps: updatedSteps,
		};
		if ( updatedSteps.indexOf( this.state.currentStep ) < 0 ) {
			debug( 'Switching to step: mainForm' );
			newState.currentStep = 'mainForm';
		}
		this.setState( newState );
	}

	getCountryCode() {
		const { contactDetails } = this.props;
		return ( contactDetails || {} ).countryCode;
	}

	isSubmitButtonDisabled() {
		return ! isEmpty( this.props.contactDetailsValidation ) || ! this.getCountryCode();
	}

	switchToNextStep() {
		const newStep = this.state.steps[ indexOf( this.state.steps, this.state.currentStep ) + 1 ];
		debug( 'Switching to step: ' + newStep );
		this.setState( { currentStep: newStep } );
	}

	validate = () => {
		// eslint-disable-next-line
		console.log( 'this.needsOnlyGoogleAppsDetails()', this.needsOnlyGoogleAppsDetails() );
		if ( this.needsOnlyGoogleAppsDetails() ) {
			return this.props.fetchGAppsValidation(
				this.state.form,
			);
		}

		this.props.fetchDomainContactValidation(
			this.getMainFieldValues(),
			this.getCartDomains(),
		);
	};

	needsOnlyGoogleAppsDetails() {
		return (
			cartItems.hasGoogleApps( this.props.cart ) &&
			! cartItems.hasDomainRegistration( this.props.cart ) &&
			! cartItems.hasTransferProduct( this.props.cart )
		);
	}

	handleChangeEvent = event => {
		const { name, value } = event.target;
		const newFormState = {};
		let phoneCountryCode = this.state.phoneCountryCode;

		if ( name === 'countryCode' ) {
			// Remove previous country-specific state value
			newFormState.state = '';
			if ( value && ! this.state.form.phone ) {
				phoneCountryCode = value;
			}

			this.focusAddressField();
		}
		newFormState[ name ] = value;

		this.setState( {
			form: {
				...this.state.form,
				...newFormState,
			},
			phoneCountryCode,
		} );
	};

	handlePhoneChange = ( { value, countryCode } ) => {
		if ( ! countries[ countryCode ] ) {
			return;
		}

		this.setState( {
			form: {
				...this.state.form,
				phone: value,
			},
			phoneCountryCode: countryCode,
		} );
	};

	getMainFieldValues() {
		const { form, phoneCountryCode } = this.state;
		return {
			...form,
			phone: toIcannFormat( form.phone, countries[ phoneCountryCode ] ),
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

	getCartDomains() {
		return map( cartItems.getDomainRegistrations( this.props.cart ), 'meta' ).concat(
			map( cartItems.getDomainTransfers( this.props.cart ), 'meta' )
		);
	}

	getFieldProps = ( name, needsChildRef ) => {
		// if we're referencing a DOM object in a child component we need to add the `inputRef` prop
		const ref = needsChildRef ? { inputRef: this.getInputRefCallback( name ) } : { ref: name };
		const { form } = this.state;
		const { contactDetailsValidation } = this.props;

		return {
			name,
			...ref,
			additionalClasses: 'checkout-field',
			value: form[ name ],
			isError: ! isEmpty( contactDetailsValidation[ name ] ),
			onChange: this.handleChangeEvent,
			errorMessage: ( contactDetailsValidation[ name ] || [] ).join( '\n' ),
			eventFormName: 'Checkout Form',
		};
	};

	needsFax() {
		return (
			this.props.contactDetails.countryCode === 'NL' && cartItems.hasTld( this.props.cart, 'nl' )
		);
	}

	allDomainProductsSupportPrivacy() {
		return cartItems.hasOnlyDomainProductsWithPrivacySupport( this.props.cart );
	}

	allDomainItemsHavePrivacy() {
		return (
			cartItems.getDomainRegistrationsWithoutPrivacy( this.props.cart ).length === 0 &&
			cartItems.getDomainTransfersWithoutPrivacy( this.props.cart ).length === 0
		);
	}

	renderSubmitButton() {
		const continueText = this.hasAnotherStep()
			? this.props.translate( 'Continue' )
			: this.props.translate( 'Continue to Checkout' );

		return (
			<FormButton
				className="checkout__domain-details-form-submit-button"
				onClick={ this.handleSubmitButtonClick }
				disabled={ this.isSubmitButtonDisabled() }
			>
				{ continueText }
			</FormButton>
		);
	}

	renderPrivacySection() {
		return (
			<PrivacyProtection
				checkPrivacyRadio={ this.allDomainItemsHavePrivacy() }
				cart={ this.props.cart }
				countriesList={ countriesList }
				disabled={ false /*formState.isSubmitButtonDisabled( this.state.form )*/ }
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
					label={ this.props.translate( 'First Name' ) }
					{ ...this.getFieldProps( 'firstName' ) }
				/>

				<Input
					label={ this.props.translate( 'Last Name' ) }
					{ ...this.getFieldProps( 'lastName' ) }
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
				{ ...this.getFieldProps( 'organization', true ) }
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
				{ ...this.getFieldProps( 'countryCode', true ) }
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

	renderDomainContactDetailsFields() {
		const { hasCountryStates } = this.props;
		const countryCode = this.getCountryCode();
		return (
			<div className="checkout__domain-contact-details-fields">
				{ this.renderOrganizationField() }
				{ this.renderEmailField() }
				{ this.renderPhoneField() }
				{ this.needsFax() && this.renderFaxField() }
				{ this.renderCountryField() }
				{ countryCode && (
					<RegionAddressFieldsets
						getFieldProps={ this.getFieldProps }
						countryCode={ countryCode }
						hasCountryStates={ hasCountryStates }
						shouldAutoFocusAddressField={ this.shouldAutoFocusAddressField }
					/>
				) }
			</div>
		);
	}

	renderDetailsForm() {
		return (
			<form>
				{ this.renderNameFields() }
				{ this.needsOnlyGoogleAppsDetails() ? (
					<GAppsFieldset getFieldProps={ this.getFieldProps } />
				) : (
					this.renderDomainContactDetailsFields()
				) }
				{ this.renderSubmitButton() }
			</form>
		);
	}

	renderExtraDetailsForm( tld ) {
		return (
			<ExtraInfoForm tld={ tld } getCartDomains={ this.getCartDomains }>
				{ this.renderSubmitButton() }
			</ExtraInfoForm>
		);
	}

	handleRadioChange = enable => {
		this.setPrivacyProtectionSubscriptions( enable );
	};

	focusAddressField() {
		const inputRef = this.inputRefs.address1;

		if ( inputRef ) {
			inputRef.focus();
		} else {
			// The preference is to fire an inputRef callback
			// when the previous and next countryCodes don't match,
			// rather than set a flag.
			// Multiple renders triggered by formState via `this.setFormState`
			// prevent it.
			this.shouldAutoFocusAddressField = true;
		}
	}

	handleSubmitButtonClick = event => {
		event.preventDefault();

		this.recordSubmit();

		if ( ! isEmpty( this.props.contactDetailsValidation ) ) {
			return;
		}

		if ( this.hasAnotherStep() ) {
			return this.switchToNextStep();
		}

		this.finish();
	};

	recordSubmit() {
		const { contactDetails, contactDetailsValidation } = this.props;
		const errors = flatten( map( contactDetailsValidation, 'errors' ) );
		const tracksEventObject = reduce(
			contactDetailsValidation,
			( result, value, key ) => {
				result[ `error_${ key }` ] = value;
				return result;
			},
			{
				errors_count: ( errors && errors.length ) || 0,
				submission_count: this.state.submissionCount + 1,
				country_code_from_form: contactDetails.countryCode,
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

	// We want to cache the functions to avoid triggering unnecessary rerenders
	getInputRefCallback( name ) {
		if ( ! this.inputRefCallbacks[ name ] ) {
			this.inputRefCallbacks[ name ] = el => ( this.inputRefs[ name ] = el );
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
		const classSet = classNames( {
			'domain-details': true,
			selected: true,
		} );

		let title;
		// TODO: gather up tld specific stuff
		if ( this.state.currentStep === 'fr' ) {
			title = this.props.translate( '.FR Registration' );
		} else if ( this.needsOnlyGoogleAppsDetails() ) {
			title = this.props.translate( 'G Suite Account Information' );
		} else {
			title = this.props.translate( 'Domain Contact Information' );
		}

		const renderPrivacy =
			( cartItems.hasDomainRegistration( this.props.cart ) ||
				cartItems.hasTransferProduct( this.props.cart ) ) &&
			this.allDomainProductsSupportPrivacy();

		return (
			<div>
				{ renderPrivacy && this.renderPrivacySection() }
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

export default connect(
	state => {
		const contactDetails = getContactDetailsCache( state );
		const hasCountryStates =
			contactDetails && contactDetails.countryCode
				? ! isEmpty( getCountryStates( state, contactDetails.countryCode ) )
				: false;
		return {
			contactDetails,
			hasCountryStates,
			contactDetailsValidation: getDomainContactValidationMessages( state ),
		};
	},
	{
		updateContactDetailsCache,
		fetchDomainContactValidation,
		fetchGAppsValidation,
	}
)( localize( DomainDetailsFormContainer ) );
