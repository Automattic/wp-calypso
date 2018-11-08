/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { debounce, intersection, map, noop } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import wp from 'lib/wp';
import { isMobile } from 'lib/viewport';
import { cartItems } from 'lib/cart-values';
import {
	addPrivacyToAllDomains,
	removePrivacyFromAllDomains,
	setBillingDetails,
	setDomainDetails,
	addGoogleAppsRegistrationData,
} from 'lib/upgrades/actions';
import QueryBillingContactDetails from 'components/data/query-billing-contact-details';
import QueryTldValidationSchemas from 'components/data/query-tld-validation-schemas';
import ContactDetailsFormFields from 'components/domains/contact-details-form-fields';
import FormCheckbox from 'components/forms/form-checkbox';
import InfoPopover from 'components/info-popover';
import { tldsWithAdditionalDetailsForms } from 'components/domains/registrant-extra-info';
import getBillingContactDetails from 'state/selectors/get-billing-contact-details';
import { updateContactDetailsCache } from 'state/domains/management/actions';
import { updateBillingContactDetails } from 'state/billing-transactions/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import SecurePaymentFormPlaceholder from './secure-payment-form-placeholder';
import PaymentBox from './payment-box';

const wpcom = wp.undocumented();

export class BillingDetailsForm extends PureComponent {
	constructor( props ) {
		super( props );
		this.debounced = {
			validateBillingDetails: debounce( this.validateBillingDetails, 300, { leading: true } ),
			validateDomainDetails: debounce( this.validateDomainDetails, 300, { leading: true } ),
		};
		this.state = {
			showDomainContactDetails: false,
			billingDetails: null,
		};
	}

	componentDidMount() {
		if ( this.props.recordTracksEvent ) {
			this.props.recordTracksEvent( 'calypso_checkout_billing_contact_information_view' );
		}
	}

	validateBillingDetails = ( fieldValues, onComplete ) => {
		const validationHandler = ( error, data ) => {
			const messages = ( data && data.messages ) || {};

			if ( ! error ) {
				this.setState( { billingDetails: fieldValues } );
				setBillingDetails( fieldValues );

				if ( ! this.state.showDomainContactDetails ) {
					setDomainDetails( fieldValues );
					addGoogleAppsRegistrationData( fieldValues );
				}
			}

			onComplete( error, messages );
		};

		wpcom.validateDomainContactInformation( fieldValues, this.getDomainNames(), validationHandler );
	};

	validateDomainDetails = ( fieldValues, onComplete ) => {
		const validationHandler = ( error, data ) => {
			const messages = ( data && data.messages ) || {};

			if ( ! error ) {
				setDomainDetails( fieldValues );
				addGoogleAppsRegistrationData( fieldValues );
			}

			onComplete( error, messages );
		};

		if ( this.needsOnlyGoogleAppsDetails() ) {
			wpcom.validateGoogleAppsContactInformation( fieldValues, validationHandler );
			return;
		}

		wpcom.validateDomainContactInformation( fieldValues, this.getDomainNames(), validationHandler );
	};

	needsDomainDetails() {
		const cart = this.props.cart;

		if ( cart && cartItems.hasOnlyRenewalItems( cart ) ) {
			return false;
		}

		return (
			cart &&
			( cartItems.hasDomainRegistration( cart ) ||
				cartItems.hasGoogleApps( cart ) ||
				cartItems.hasTransferProduct( cart ) )
		);
	}

	needsOnlyGoogleAppsDetails() {
		return (
			cartItems.hasGoogleApps( this.props.cart ) &&
			! cartItems.hasDomainRegistration( this.props.cart ) &&
			! cartItems.hasTransferProduct( this.props.cart )
		);
	}

	getDomainNames = () =>
		map(
			[
				...cartItems.getDomainRegistrations( this.props.cart ),
				...cartItems.getDomainTransfers( this.props.cart ),
			],
			'meta'
		);

	getTldsWithAdditionalForm() {
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

	handleBillingDetailsChange = newContactDetailsValues => {
		this.props.updateBillingContactDetails( newContactDetailsValues );
		this.debounced.validateBillingDetails( newContactDetailsValues, noop );
	};

	handleDomainDetailsChange = newContactDetailsValues => {
		this.props.updateContactDetailsCache( newContactDetailsValues );
		this.debounced.validateDomainDetails( newContactDetailsValues, noop );
	};

	renderContactDetailsFields() {
		const { contactDetails, translate, userCountryCode } = this.props;
		const labelTexts = {
			organization: translate( '+ Add organization name' ),
		};

		return (
			<>
				<ContactDetailsFormFields
					userCountryCode={ userCountryCode }
					contactDetails={ contactDetails }
					needsFax={ this.needsFax() }
					onContactDetailsChange={ this.handleBillingDetailsChange }
					eventFormName="Checkout Billing Details Form"
					onSubmit={ this.handleSubmit }
					onValidate={ this.validateBillingDetails }
					labelTexts={ labelTexts }
					cart={ this.props.cart }
					hideFooter={ true }
				>
					{ this.renderDomainToggleCheckbox() }
				</ContactDetailsFormFields>

				{ this.needsDomainDetails() &&
					this.state.showDomainContactDetails && (
						<ContactDetailsFormFields
							userCountryCode={ userCountryCode }
							contactDetails={ contactDetails }
							needsFax={ this.needsFax() }
							onContactDetailsChange={ this.handleDomainDetailsChange }
							eventFormName="Checkout Domain Details Form"
							onSubmit={ this.handleSubmit }
							onValidate={ this.validateDomainDetails }
							labelTexts={ labelTexts }
							cart={ this.props.cart }
							hideFooter={ true }
						/>
					) }
			</>
		);
	}

	handleDomainDetailsToggle = () => {
		const { billingDetails, showDomainContactDetails } = this.state;

		if ( showDomainContactDetails && billingDetails ) {
			setDomainDetails( billingDetails );
			addGoogleAppsRegistrationData( billingDetails );
		}

		this.setState( { showDomainContactDetails: ! showDomainContactDetails } );
	};

	renderDomainToggleCheckbox() {
		const { translate } = this.props;
		const { showDomainContactDetails } = this.state;

		if ( ! this.needsDomainDetails() ) {
			return null;
		}

		return (
			<div className="checkout__domain-registration-information">
				<div className="checkout__domain-registration-information-title">
					{ translate( 'Domain Registration Information' ) }
				</div>
				{ this.renderDomainPrivacy() }
				<label className="checkout__different-domain-details-label">
					<FormCheckbox
						checked={ ! showDomainContactDetails }
						className="checkout__different-domain-details"
						onChange={ this.handleDomainDetailsToggle }
					/>
					<span>
						{ translate( 'Use this as my domain contact information' ) }
						<InfoPopover
							className="checkout__item-tip-info"
							position={ isMobile() ? 'left' : 'right' }
						>
							{ translate(
								'Domain owners are required to share contact information in a public database of all domains.'
							) }
						</InfoPopover>
					</span>
				</label>
			</div>
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

	handleDomainPrivacyChange = event => {
		if ( true === event.target.checked ) {
			addPrivacyToAllDomains();
		} else {
			removePrivacyFromAllDomains();
		}
	};

	renderDomainPrivacy() {
		const { cart, translate } = this.props;
		const renderPrivacy =
			( cartItems.hasDomainRegistration( cart ) || cartItems.hasTransferProduct( cart ) ) &&
			this.allDomainProductsSupportPrivacy();

		if ( ! renderPrivacy ) {
			return false;
		}

		return (
			<label className="checkout__domain-privacy-label">
				<FormCheckbox
					checked={ this.allDomainItemsHavePrivacy() }
					className="checkout__domain-privacy"
					onChange={ this.handleDomainPrivacyChange }
				/>
				<span>
					{ translate( 'Register my domain with privacy protection (recommended)' ) }
					<InfoPopover
						className="checkout__item-tip-info"
						position={ isMobile() ? 'left' : 'right' }
					>
						{ translate(
							'Protects your identity and prevents spam by keeping your contact information off the Internet.'
						) }
					</InfoPopover>
				</span>
			</label>
		);
	}

	getFormHeaderText() {
		const { translate } = this.props;
		const defaultMessage = translate(
			'For your convenience, we have pre-filled your WordPress.com contact information. Please ' +
				"review this to be sure it's correct."
		);

		if ( this.needsDomainDetails() ) {
			//@TODO Need to figure out how to display this only if domains are in the cart
			return {
				title: translate( 'Billing & Domain Contact Information' ),
				message: defaultMessage,
			};
		}

		return {
			title: translate( 'Billing Information' ),
			message: defaultMessage,
		};
	}

	handleSubmit = event => {
		if ( event && event.preventDefault ) {
			event.preventDefault();
		}
	};

	render() {
		const { title, message } = this.getFormHeaderText();
		const classSet = classNames( {
			'domain-details': true,
			selected: true,
		} );

		if ( ! this.props.contactDetails ) {
			return (
				<div>
					<QueryBillingContactDetails />
					<SecurePaymentFormPlaceholder />
				</div>
			);
		}

		return (
			<div>
				<QueryTldValidationSchemas tlds={ this.getTldsWithAdditionalForm() } />
				<PaymentBox currentPage="main-form" classSet={ classSet } title={ title }>
					{ message && <p>{ message }</p> }
					<form onSubmit={ this.handleSubmit }>{ this.renderContactDetailsFields() }</form>
				</PaymentBox>
			</div>
		);
	}
}

export default connect(
	state => ( { contactDetails: getBillingContactDetails( state ) } ),
	{
		recordTracksEvent,
		updateBillingContactDetails,
		updateContactDetailsCache,
	}
)( localize( BillingDetailsForm ) );
