/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import debugFactory from 'debug';
import { first, includes, indexOf, intersection, isEqual, last, map, merge } from 'lodash';
import emailValidator from 'email-validator';

/**
 * Internal dependencies
 */
import QueryContactDetailsCache from 'components/data/query-contact-details-cache';
import QueryTldValidationSchemas from 'components/data/query-tld-validation-schemas';
import PaymentBox from './payment-box';
import FormButton from 'components/forms/form-button';
import SecurePaymentFormPlaceholder from './secure-payment-form-placeholder.jsx';
import wp from 'lib/wp';
import config from 'config';
import ContactDetailsFormFields from 'components/domains/contact-details-form-fields';
import ExtraInfoForm, {
	tldsWithAdditionalDetailsForms,
} from 'components/domains/registrant-extra-info';
import { setDomainDetails } from 'lib/transaction/actions';
import { addGoogleAppsRegistrationData } from 'lib/cart/actions';
import {
	getDomainRegistrations,
	getDomainTransfers,
	hasGoogleApps,
	hasDomainRegistration,
	hasInvalidAlternateEmailDomain,
	needsExplicitAlternateEmailForGSuite,
	hasTransferProduct,
	getTlds,
	hasTld,
	hasSomeDomainProductsWithPrivacySupport,
	hasAllDomainProductsWithPrivacySupport,
} from 'lib/cart-values/cart-items';
import getContactDetailsCache from 'state/selectors/get-contact-details-cache';
import { updateContactDetailsCache } from 'state/domains/management/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import { PUBLIC_VS_PRIVATE } from 'lib/url/support';

const debug = debugFactory( 'calypso:my-sites:upgrades:checkout:domain-details' );
const wpcom = wp.undocumented();

export class DomainDetailsForm extends PureComponent {
	constructor( props ) {
		super( props );
		const steps = [ 'mainForm', ...this.getTldsWithAdditionalForm() ];
		debug( 'steps:', steps );
		this.state = {
			steps,
			currentStep: first( steps ),
		};
	}

	componentDidMount() {
		if ( this.props.recordTracksEvent ) {
			this.props.recordTracksEvent( 'calypso_checkout_domain_contact_information_view' );
		}
	}

	componentDidUpdate( prevProps ) {
		if ( ! isEqual( prevProps.cart, this.props.cart ) ) {
			this.validateSteps();
		}
	}

	validateSteps() {
		const updatedSteps = [ 'mainForm', ...this.getTldsWithAdditionalForm() ];
		const newState = {
			steps: updatedSteps,
		};
		if ( updatedSteps.indexOf( this.state.currentStep ) < 0 ) {
			debug( 'Switching to step: mainForm' );
			newState.currentStep = 'mainForm';
		}
		this.setState( newState );
	}

	addAlternateEmailToValidationHandler = ( fieldValues, validationHandler ) => ( error, data ) => {
		if ( this.needsAlternateEmailForGSuite() ) {
			let message = null;
			if ( ! emailValidator.validate( fieldValues.alternateEmail ) ) {
				message = this.props.translate( 'Please provide a valid email address.' );
			} else if ( hasInvalidAlternateEmailDomain( this.props.cart, this.props.contactDetails ) ) {
				message = this.props.translate(
					'Please provide an email address that does not use the same domain than the G Suite account being purchased.'
				);
			}
			if ( null !== message ) {
				data = merge( data, { success: false, messages: { alternateEmail: [ message ] } } );
			}
		}
		validationHandler( error, data );
	};

	validate = ( fieldValues, onComplete ) => {
		const validationHandler = ( error, data ) => {
			const messages = ( data && data.messages ) || {};
			onComplete( error, messages );
		};

		if ( this.needsOnlyGoogleAppsDetails() ) {
			wpcom.validateGoogleAppsContactInformation(
				fieldValues,
				this.addAlternateEmailToValidationHandler( fieldValues, validationHandler )
			);
			return;
		}

		wpcom.validateDomainContactInformation( fieldValues, this.getDomainNames(), validationHandler );
	};

	hasAnotherStep() {
		return this.state.currentStep !== last( this.state.steps );
	}

	switchToNextStep() {
		const newStep = this.state.steps[ indexOf( this.state.steps, this.state.currentStep ) + 1 ];
		debug( 'Switching to step: ' + newStep );
		this.setState( { currentStep: newStep } );
	}

	getDomainNames = () =>
		map(
			[ ...getDomainRegistrations( this.props.cart ), ...getDomainTransfers( this.props.cart ) ],
			'meta'
		);

	needsAlternateEmailForGSuite() {
		return (
			this.needsOnlyGoogleAppsDetails() &&
			needsExplicitAlternateEmailForGSuite( this.props.cart, this.props.contactDetails )
		);
	}

	needsOnlyGoogleAppsDetails() {
		return (
			hasGoogleApps( this.props.cart ) &&
			! hasDomainRegistration( this.props.cart ) &&
			! hasTransferProduct( this.props.cart )
		);
	}

	getNumberOfDomainRegistrations() {
		return getDomainRegistrations( this.props.cart ).length;
	}

	getTldsWithAdditionalForm() {
		if ( ! config.isEnabled( 'domains/cctlds' ) ) {
			// All we need to do to disable everything is not show the .FR form
			return [];
		}
		return intersection( getTlds( this.props.cart ), tldsWithAdditionalDetailsForms );
	}

	needsFax() {
		return this.props.contactDetails.countryCode === 'NL' && hasTld( this.props.cart, 'nl' );
	}

	renderSubmitButton() {
		return (
			<FormButton
				className="checkout__domain-details-form-submit-button"
				onClick={ this.handleSubmitButtonClick }
			>
				{ this.props.translate( 'Continue' ) }
			</FormButton>
		);
	}

	handleContactDetailsChange = ( newContactDetailsValues ) => {
		this.props.updateContactDetailsCache( newContactDetailsValues );
	};

	renderDomainContactDetailsFields() {
		const { contactDetails, translate, userCountryCode } = this.props;
		const labelTexts = {
			submitButton: translate( 'Continue' ),
			organization: translate(
				'Registering this domain for a company? + Add Organization Name',
				'Registering these domains for a company? + Add Organization Name',
				{
					count: this.getNumberOfDomainRegistrations(),
				}
			),
		};
		return (
			<ContactDetailsFormFields
				userCountryCode={ userCountryCode }
				contactDetails={ contactDetails }
				needsFax={ this.needsFax() }
				needsOnlyGoogleAppsDetails={ this.needsOnlyGoogleAppsDetails() }
				needsAlternateEmailForGSuite={ this.needsAlternateEmailForGSuite() }
				onContactDetailsChange={ this.handleContactDetailsChange }
				onSubmit={ this.handleSubmitButtonClick }
				eventFormName="Checkout Form"
				onValidate={ this.validate }
				labelTexts={ labelTexts }
			/>
		);
	}

	renderDetailsForm() {
		return <form>{ this.renderDomainContactDetailsFields() }</form>;
	}

	renderExtraDetailsForm( tld ) {
		return (
			<ExtraInfoForm tld={ tld } getDomainNames={ this.getDomainNames }>
				{ this.renderSubmitButton() }
			</ExtraInfoForm>
		);
	}

	handleSubmitButtonClick = ( event ) => {
		if ( event && event.preventDefault ) {
			event.preventDefault();
		}
		if ( this.hasAnotherStep() ) {
			return this.switchToNextStep();
		}
		this.finish();
	};

	finish() {
		const allFieldValues = this.props.contactDetails;
		debug( 'finish: allFieldValues:', allFieldValues );
		setDomainDetails( allFieldValues );
		addGoogleAppsRegistrationData( allFieldValues );
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

		const hasDomainProduct =
			hasDomainRegistration( this.props.cart ) || hasTransferProduct( this.props.cart );
		const hasSomeDomainsWithPrivacy =
			hasDomainProduct && hasSomeDomainProductsWithPrivacySupport( this.props.cart );
		const hasAllDomainsWithPrivacy =
			hasDomainProduct && hasAllDomainProductsWithPrivacySupport( this.props.cart );

		let title;
		let message;
		// TODO: gather up tld specific stuff
		if ( this.state.currentStep === 'fr' ) {
			title = this.props.translate( '.FR Registration' );
		} else if ( this.needsOnlyGoogleAppsDetails() ) {
			title = this.props.translate( 'G Suite Account Information' );
		} else {
			title = this.props.translate( 'Domain Contact Information' );
			if ( hasDomainProduct ) {
				if ( hasSomeDomainsWithPrivacy ) {
					if ( hasAllDomainsWithPrivacy ) {
						message = this.props.translate(
							'We have pre-filled the required contact information from your WordPress.com account. Privacy ' +
								'Protection is included to help protect your personal information. {{a}}Learn more{{/a}}',
							{
								components: {
									a: <a href={ PUBLIC_VS_PRIVATE } target="_blank" rel="noopener noreferrer" />,
								},
							}
						);
					} else {
						message = this.props.translate(
							'We have pre-filled the required contact information from your WordPress.com account. Privacy ' +
								'Protection is included for all eligible domains to help protect your personal information. {{a}}Learn more{{/a}}',
							{
								components: {
									a: <a href={ PUBLIC_VS_PRIVATE } target="_blank" rel="noopener noreferrer" />,
								},
							}
						);
					}
				} else {
					message = this.props.translate(
						'We have pre-filled the required contact information from your WordPress.com account. Privacy ' +
							'Protection is unavailable for domains in your cart.'
					);
				}
			}
		}

		return (
			<div>
				<QueryTldValidationSchemas tlds={ this.getTldsWithAdditionalForm() } />
				<PaymentBox currentPage={ this.state.currentStep } classSet={ classSet } title={ title }>
					{ message && <p>{ message }</p> }
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

export default connect( ( state ) => ( { contactDetails: getContactDetailsCache( state ) } ), {
	recordTracksEvent,
	updateContactDetailsCache,
} )( localize( DomainDetailsFormContainer ) );
