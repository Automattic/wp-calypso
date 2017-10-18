/*eslint-disable*/
/*




Notes:
- inputFocus on Error



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
import { CountrySelect, Input, HiddenInput } from 'my-sites/domains/components/form';
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
import GAppsFieldset from 'my-sites/domains/components/domain-form-fieldsets/g-apps-fieldset';
import RegionAddressFieldsets from 'my-sites/domains/components/domain-form-fieldsets/region-address-fieldsets';
import ContactDetailsFormFields from 'components/contact-details-form-fields';

const debug = debugFactory( 'calypso:my-sites:upgrades:checkout:domain-details' );
const wpcom = wp.undocumented(),
	countriesList = countriesListForDomainRegistrations();

export class DomainDetailsForm extends PureComponent {
	constructor( props, context ) {
		super( props, context );


		const steps = [ 'mainForm', ...this.getRequiredExtraSteps() ];
		debug( 'steps:', steps );

		this.state = {
			steps,
			currentStep: first( steps )
		};

		this.contactDetailsFormFieldsInstance = null;
	}

	componentWillMount() {

	}

	componentDidMount() {
		analytics.pageView.record(
			'/checkout/domain-contact-information',
			'Checkout > Domain Contact Information'
		);
	}

	// componentDidUpdate( prevProps, prevState ) {
	// 		const previousFormValues = formState.getAllFieldValues( prevState.form );
	// 		const currentFormValues = formState.getAllFieldValues( this.state.form );
	// 	if ( ! isEqual( previousFormValues, currentFormValues ) ) {
	// 		this.props.updateContactDetailsCache( this.getMainFieldValues() );
	// 	}
	// }

	// loadFormStateFromRedux = fn => {
	// 	// only load the properties relevant to the main form fields
	// 	fn( null, pick( this.props.contactDetails, this.fieldNames ) );
	// };

	validate = ( fieldValues, onComplete ) => {

		const validationHandler = ( error, data ) => {
			const messages = ( data && data.messages ) || {};
			onComplete( error, messages );
		};

		if ( this.needsOnlyGoogleAppsDetails() ) {
			wpcom.validateGoogleAppsContactInformation(
				fieldValues,
				validationHandler
			);
			return;
		}

		const domainNames = map( cartItems.getDomainRegistrations( this.props.cart ), 'meta' );
		wpcom.validateDomainContactInformation(
			fieldValues,
			domainNames,
			validationHandler
		);
	};


	hasAnotherStep() {
		return this.state.currentStep !== last( this.state.steps );
	}

	switchToNextStep() {
		const newStep = this.state.steps[ indexOf( this.state.steps, this.state.currentStep ) + 1 ];
		debug( 'Switching to step: ' + newStep );
		this.setState( { currentStep: newStep } );
	}

	needsOnlyGoogleAppsDetails() {
		return (
			cartItems.hasGoogleApps( this.props.cart ) &&
			! cartItems.hasDomainRegistration( this.props.cart )
		);
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



	// new component methods
	handleContactDetailsChange = ( newContactDetails ) => {
		// eslint-disable-next-line
		console.log( 'handleContactDetailsChange', newContactDetails );
		this.props.updateContactDetailsCache( newContactDetails );
	};

	renderDomainContactDetailsFields() {
		const { contactDetails } = this.props;
		return (
			<ContactDetailsFormFields
				contactDetails={ contactDetails }
				needneedsFaxsFax={ this.needsFax() }
				onFieldChange={ this.handleContactDetailsChange }
				onSubmit={ () => { console.log('submitto') } }
				eventFormName="Checkout Form"
				onValidate={ this.validate }
			/> );
	}

	renderDetailsForm() {
		return (
			<form>
				{/*{ this.renderNameFields() }*/}
				{ this.needsOnlyGoogleAppsDetails() ? (
					<GAppsFieldset getFieldProps={ this.getFieldProps } />
				) : (
					this.renderDomainContactDetailsFields()
				) }
{/*				{ this.renderSubmitButton() }*/}
			</form>
		);
	}

	renderExtraDetailsForm( tld ) {
		return <ExtraInfoForm tld={ tld }>{ this.renderSubmitButton() }</ExtraInfoForm>;
	}

	handleRadioChange = enable => {
		this.setPrivacyProtectionSubscriptions( enable );
	};

	handleSubmitButtonClick = () => {
		if ( this.hasAnotherStep() ) {
			return this.switchToNextStep();
		}
		this.finish();
	};

	recordSubmit() {
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
