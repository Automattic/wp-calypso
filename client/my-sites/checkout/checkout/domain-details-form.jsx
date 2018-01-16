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
	camelCase,
	deburr,
	first,
	head,
	includes,
	indexOf,
	intersection,
	isEmpty,
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
import { getCountryStates } from 'state/country-states/selectors';
import { updateContactDetailsCache } from 'state/domains/management/actions';
import QueryContactDetailsCache from 'components/data/query-contact-details-cache';
import { CountrySelect, Input, HiddenInput } from 'my-sites/domains/components/form';
import PrivacyProtection from './privacy-protection';
import PaymentBox from './payment-box';
import { cartItems } from 'lib/cart-values';
import { forDomainRegistrations as countriesList } from 'lib/countries-list';
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
import GAppsFieldset from 'my-sites/domains/components/domain-form-fieldsets/g-apps-fieldset';
import RegionAddressFieldsets from 'my-sites/domains/components/domain-form-fieldsets/region-address-fieldsets';
import NoticeErrorMessage from 'my-sites/checkout/checkout/notice-error-message';
import notices from 'notices';
import { CALYPSO_CONTACT } from 'lib/url/support';

const debug = debugFactory( 'calypso:my-sites:upgrades:checkout:domain-details' );
const wpcom = wp.undocumented();

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
		this.shouldAutoFocusAddressField = false;
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
		if ( analytics ) {
			analytics.pageView.record(
				'/checkout/domain-contact-information',
				'Checkout > Domain Contact Information'
			);
		}
	}

	componentDidUpdate( prevProps, prevState ) {
		const previousFormValues = formState.getAllFieldValues( prevState.form );
		const currentFormValues = formState.getAllFieldValues( this.state.form );
		if ( ! isEqual( previousFormValues, currentFormValues ) ) {
			this.props.updateContactDetailsCache( this.getMainFieldValues() );
		}

		if ( ! isEqual( prevProps.cart, this.props.cart ) ) {
			this.validateSteps();
		}
	}

	loadFormStateFromRedux = fn => {
		// only load the properties relevant to the main form fields
		fn( null, pick( this.props.contactDetails, this.fieldNames ) );
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

	switchToNextStep() {
		const newStep = this.state.steps[ indexOf( this.state.steps, this.state.currentStep ) + 1 ];
		debug( 'Switching to step: ' + newStep );
		this.setState( { currentStep: newStep } );
	}

	validate = ( fieldValues, onComplete ) => {
		if ( this.needsOnlyGoogleAppsDetails() ) {
			wpcom.validateGoogleAppsContactInformation(
				fieldValues,
				this.generateValidationHandler( onComplete )
			);
			return;
		}

		const allFieldValues = this.getMainFieldValues();
		const domainNames = map( cartItems.getDomainRegistrations( this.props.cart ), 'meta' ).concat(
			map( cartItems.getDomainTransfers( this.props.cart ), 'meta' )
		);
		wpcom.validateDomainContactInformation(
			allFieldValues,
			domainNames,
			this.generateValidationHandler( onComplete )
		);
	};

	generateValidationHandler( onComplete ) {
		return ( error, data ) => {
			const messages = ( data && data.messages ) || {};
			onComplete( error, messages );
		};
	}

	setFormState = form => {
		if ( ! this.needsFax() ) {
			delete form.fax;
		}
		this.setState( { form } );
	};

	needsOnlyGoogleAppsDetails() {
		return (
			cartItems.hasGoogleApps( this.props.cart ) &&
			! cartItems.hasDomainRegistration( this.props.cart ) &&
			! cartItems.hasTransferProduct( this.props.cart )
		);
	}

	handleFormControllerError = error => {
		throw error;
	};

	handleChangeEvent = event => {
		const { name, value } = event.target;

		if ( name === 'country-code' ) {
			// Remove previous country-specific state value
			this.formStateController.handleFieldChange( {
				name: 'state',
				value: '',
				hideError: true,
			} );

			if ( value && ! formState.getFieldValue( this.state.form, 'phone' ) ) {
				this.setState( {
					phoneCountryCode: value,
				} );
			}

			this.focusAddressField();
		}

		this.formStateController.handleFieldChange( {
			name,
			value,
		} );
	};

	handlePhoneChange = ( { value, countryCode } ) => {
		this.formStateController.handleFieldChange( {
			name: 'phone',
			value,
		} );

		if ( ! countries[ countryCode ] ) {
			return;
		}

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

	getFieldProps = ( name, needsChildRef ) => {
		// if we're referencing a DOM object in a child component we need to add the `inputRef` prop
		const ref = needsChildRef ? { inputRef: this.getInputRefCallback( name ) } : { ref: name };
		const { form } = this.state;

		return {
			name,
			...ref,
			additionalClasses: 'checkout-field',
			value: formState.getFieldValue( form, name ) || '',
			isError: formState.isFieldInvalid( form, name ),
			disabled: formState.isFieldDisabled( form, name ),
			onChange: this.handleChangeEvent,
			// The keys are mapped to snake_case when going to API and camelCase when the response is parsed and we are using
			// kebab-case for HTML, so instead of using different variations all over the place, this accepts kebab-case and
			// converts it to camelCase which is the format stored in the formState.
			errorMessage: ( formState.getFieldErrorMessages( form, camelCase( name ) ) || [] ).join(
				'\n'
			),
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
				disabled={ ! this.getCountryCode() }
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
				{ ...this.getFieldProps( 'country-code', true ) }
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
			<ExtraInfoForm tld={ tld } getFieldProps={ this.getFieldProps }>
				{ this.renderSubmitButton() }
			</ExtraInfoForm>
		);
	}

	handleRadioChange = enable => {
		this.setPrivacyProtectionSubscriptions( enable );
	};

	focusFirstError() {
		const firstErrorName = kebabCase( head( formState.getInvalidFields( this.state.form ) ).name );
		const firstErrorRef = this.inputRefs[ firstErrorName ] || this.refs[ firstErrorName ];

		try {
			firstErrorRef.focus();
		} catch ( err ) {
			const noticeMessage = this.props.translate(
				'There was a problem validating your contact details: {{firstErrorName/}} required. ' +
					'Please try again or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
				{
					components: {
						contactSupportLink: <a href={ CALYPSO_CONTACT } />,
						firstErrorName: <NoticeErrorMessage message={ firstErrorName } />,
					},
					comment: 'Validation error when filling out domain checkout contact details form',
				}
			);
			notices.error( noticeMessage );
			throw new Error(
				`Cannot focus() on invalid form element in domain details checkout form with name: '${ firstErrorName }'`
			);
		}
	}

	focusAddressField() {
		const inputRef = this.inputRefs[ 'address-1' ];

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
		const { contactDetails } = this.props;
		const errors = formState.getErrorMessages( this.state.form );
		const tracksEventObject = reduce(
			formState.getErrorMessages( this.state.form ),
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
		};
	},
	{ updateContactDetailsCache }
)( localize( DomainDetailsFormContainer ) );
