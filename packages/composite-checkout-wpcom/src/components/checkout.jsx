/**
 * External dependencies
 */
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslate } from 'i18n-calypso';
import {
	Checkout,
	CheckoutProvider,
	getDefaultPaymentMethodStep,
	useIsStepActive,
	useSelect,
} from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { areDomainsInLineItems } from '../hooks/has-domains';
import { OrderReview } from './order-review';
import WPCheckoutOrderSummary, { WPCheckoutOrderSummaryTitle } from './wp-checkout-order-summary';
import WPContactForm from './wp-contact-form';

// These are used only for non-redirect payment methods
// TODO: write this
const onSuccess = () => alert( 'Payment succeeded!' );
const onFailure = error => alert( 'There was a problem with your payment' + error );

// These are used only for redirect payment methods
const successRedirectUrl = window.location.href;
const failureRedirectUrl = window.location.href;

// Called when the store is changed.
const handleCheckoutEvent = () => () => {
	// TODO: write this
};

const ContactFormTitle = () => {
	const translate = useTranslate();
	const isActive = useIsStepActive();
	return isActive ? translate( 'Billing details' ) : translate( 'Enter your billing details' );
};

const OrderReviewTitle = () => {
	const translate = useTranslate();
	return translate( 'Review your order' );
};

// This is the parent component which would be included on a host page
export function WPCOMCheckout( { useShoppingCart, availablePaymentMethods, registry } ) {
	const translate = useTranslate();
	const { itemsWithTax, total, deleteItem, changePlanLength } = useShoppingCart();

	const { select, subscribe, registerStore } = registry;
	useWpcomStore( registerStore );

	useEffect( () => {
		return subscribe( handleCheckoutEvent( select ) );
	}, [ select, subscribe ] );

	const ReviewContent = () => (
		<OrderReview
			items={ itemsWithTax }
			total={ total }
			onDeleteItem={ deleteItem }
			onChangePlanLength={ changePlanLength }
		/>
	);

	const contactInfo = useSelect( sel => sel( 'wpcom' ).getContactInfo() ) || {};
	const domainContactInfo = useSelect( sel => sel( 'wpcom' ).getDomainContactInfo() ) || {};
	const isDomainContactSame = useSelect( sel => sel( 'wpcom' ).isDomainContactSame() ) || false;

	const steps = [
		{
			id: 'order-summary',
			className: 'checkout__order-summary-step',
			hasStepNumber: false,
			titleContent: <WPCheckoutOrderSummaryTitle />,
			completeStepContent: <WPCheckoutOrderSummary />,
			isCompleteCallback: () => true,
		},
		{
			...getDefaultPaymentMethodStep(),
			getEditButtonAriaLabel: () => translate( 'Edit the payment method' ),
			getNextStepButtonAriaLabel: () => translate( 'Continue with the selected payment method' ),
		},
		{
			id: 'contact-form',
			className: 'checkout__billing-details-step',
			hasStepNumber: true,
			titleContent: <ContactFormTitle />,
			activeStepContent: <WPContactForm isComplete={ false } isActive={ true } />,
			completeStepContent: <WPContactForm summary isComplete={ true } isActive={ false } />,
			isCompleteCallback: () =>
				isFormComplete( contactInfo, domainContactInfo, isDomainContactSame ),
			isEditableCallback: () => isFormEditable( select ),
			getEditButtonAriaLabel: () => translate( 'Edit the billing details' ),
			getNextStepButtonAriaLabel: () => translate( 'Continue with the entered billing details' ),
		},
		{
			id: 'order-review',
			className: 'checkout__review-order-step',
			hasStepNumber: true,
			titleContent: <OrderReviewTitle />,
			activeStepContent: <ReviewContent />,
			isCompleteCallback: ( { activeStep } ) => {
				const isActive = activeStep.id === 'order-review';
				return isActive;
			},
		},
	];

	return (
		<CheckoutProvider
			locale={ 'en-us' }
			items={ itemsWithTax }
			total={ total }
			onSuccess={ onSuccess }
			onFailure={ onFailure }
			successRedirectUrl={ successRedirectUrl }
			failureRedirectUrl={ failureRedirectUrl }
			paymentMethods={ availablePaymentMethods }
			registry={ registry }
		>
			<Checkout steps={ steps } />
		</CheckoutProvider>
	);
}

WPCOMCheckout.propTypes = {
	availablePaymentMethods: PropTypes.arrayOf( PropTypes.object ).isRequired,
	useShoppingCart: PropTypes.func.isRequired,
	registry: PropTypes.object.isRequired,
};

function useWpcomStore( registerStore ) {
	const registerComplete = useRef();
	// Only register once
	if ( registerComplete.current ) {
		return;
	}

	function contactReducer( state = {}, action ) {
		switch ( action.type ) {
			case 'CONTACT_SET_FIRST_NAME':
				return { ...state, firstName: action.payload };
			case 'CONTACT_SET_LAST_NAME':
				return { ...state, lastName: action.payload };
			case 'CONTACT_SET_EMAIL':
				return { ...state, email: action.payload };
			case 'CONTACT_SET_PHONE_NUMBER':
				return { ...state, phoneNumber: action.payload };
			case 'CONTACT_SET_ADDRESS':
				return { ...state, address: action.payload };
			case 'CONTACT_SET_CITY':
				return { ...state, city: action.payload };
			case 'CONTACT_SET_STATE':
				return { ...state, state: action.payload };
			case 'CONTACT_SET_PROVINCE':
				return { ...state, province: action.payload };
			case 'CONTACT_SET_COUNTRY':
				return { ...state, country: action.payload };
			case 'CONTACT_SET_POSTAL_CODE':
				return { ...state, postalCode: action.payload };
			case 'CONTACT_SET_VAT':
				return { ...state, vatId: action.payload };
			default:
				return state;
		}
	}

	function domainContactReducer( state = {}, action ) {
		switch ( action.type ) {
			case 'CONTACT_SET_DOMAIN_FIRST_NAME':
				return { ...state, firstName: action.payload };
			case 'CONTACT_SET_DOMAIN_LAST_NAME':
				return { ...state, lastName: action.payload };
			case 'CONTACT_SET_DOMAIN_EMAIL':
				return { ...state, email: action.payload };
			case 'CONTACT_SET_DOMAIN_PHONE_NUMBER':
				return {
					...state,
					phoneNumber: action.payload,
				};
			case 'CONTACT_SET_DOMAIN_ADDRESS':
				return { ...state, address: action.payload };
			case 'CONTACT_SET_DOMAIN_CITY':
				return { ...state, city: action.payload };
			case 'CONTACT_SET_DOMAIN_STATE':
				return { ...state, state: action.payload };
			case 'CONTACT_SET_DOMAIN_PROVINCE':
				return { ...state, province: action.payload };
			case 'CONTACT_SET_DOMAIN_COUNTRY':
				return { ...state, country: action.payload };
			case 'CONTACT_SET_DOMAIN_POSTAL_CODE':
				return {
					...state,
					postalCode: action.payload,
				};
			default:
				return state;
		}
	}

	function isDomainContactSameReducer( state = true, action ) {
		switch ( action.type ) {
			case 'CONTACT_SET_DOMAIN_SAME':
				return action.payload;
			default:
				return state;
		}
	}

	registerStore( 'wpcom', {
		reducer( state = {}, action ) {
			return {
				isDomainContactSame: isDomainContactSameReducer( state.isDomainContactSame, action ),
				contact: contactReducer( state.contact, action ),
				domainContact: domainContactReducer( state.domainContact, action ),
			};
		},

		actions: {
			setIsDomainContactSame( payload ) {
				return { type: 'CONTACT_SET_DOMAIN_SAME', payload };
			},

			setFirstName( payload ) {
				return { type: 'CONTACT_SET_FIRST_NAME', payload };
			},
			setLastName( payload ) {
				return { type: 'CONTACT_SET_LAST_NAME', payload };
			},
			setEmail( payload ) {
				return { type: 'CONTACT_SET_EMAIL', payload };
			},
			setPhoneNumber( payload ) {
				return { type: 'CONTACT_SET_PHONE_NUMBER', payload };
			},
			setAddress( payload ) {
				return { type: 'CONTACT_SET_ADDRESS', payload };
			},
			setCity( payload ) {
				return { type: 'CONTACT_SET_CITY', payload };
			},
			setState( payload ) {
				return { type: 'CONTACT_SET_STATE', payload };
			},
			setProvince( payload ) {
				return { type: 'CONTACT_SET_PROVINCE', payload };
			},
			setCountry( payload ) {
				return { type: 'CONTACT_SET_COUNTRY', payload };
			},
			setPostalCode( payload ) {
				return { type: 'CONTACT_SET_POSTAL_CODE', payload };
			},
			setVatId( payload ) {
				return { type: 'CONTACT_SET_VAT', payload };
			},

			setDomainFirstName( payload ) {
				return { type: 'CONTACT_SET_DOMAIN_FIRST_NAME', payload };
			},
			setDomainLastName( payload ) {
				return { type: 'CONTACT_SET_DOMAIN_LAST_NAME', payload };
			},
			setDomainEmail( payload ) {
				return { type: 'CONTACT_SET_DOMAIN_EMAIL', payload };
			},
			setDomainPhoneNumber( payload ) {
				return { type: 'CONTACT_SET_DOMAIN_PHONE_NUMBER', payload };
			},
			setDomainAddress( payload ) {
				return { type: 'CONTACT_SET_DOMAIN_ADDRESS', payload };
			},
			setDomainCity( payload ) {
				return { type: 'CONTACT_SET_DOMAIN_CITY', payload };
			},
			setDomainState( payload ) {
				return { type: 'CONTACT_SET_DOMAIN_STATE', payload };
			},
			setDomainProvince( payload ) {
				return { type: 'CONTACT_SET_DOMAIN_PROVINCE', payload };
			},
			setDomainCountry( payload ) {
				return { type: 'CONTACT_SET_DOMAIN_COUNTRY', payload };
			},
			setDomainPostalCode( payload ) {
				return { type: 'CONTACT_SET_DOMAIN_POSTAL_CODE', payload };
			},
		},

		selectors: {
			isDomainContactSame( state ) {
				return state.isDomainContactSame;
			},

			getContactInfo( state ) {
				return {
					firstName: state.contact.firstName,
					lastName: state.contact.lastName,
					email: state.contact.email,
					address: state.contact.address,
					city: state.contact.city,
					state: state.contact.state,
					province: state.contact.province,
					country: state.contact.country,
					postalCode: state.contact.postalCode,
					phoneNumber: state.contact.phoneNumber,
					vatId: state.contact.vatId,
				};
			},

			getDomainContactInfo( state ) {
				return {
					firstName: state.domainContact.firstName,
					lastName: state.domainContact.lastName,
					email: state.domainContact.email,
					address: state.domainContact.address,
					city: state.domainContact.city,
					state: state.domainContact.state,
					province: state.domainContact.province,
					country: state.domainContact.country,
					postalCode: state.domainContact.postalCode,
					phoneNumber: state.domainContact.phoneNumber,
					vatId: state.contact.vatId, // There is only one vatId
				};
			},
		},
	} );
	registerComplete.current = true;
}

function isFormComplete( contactInfo, domainContactInfo, isDomainContactSame ) {
	const taxFields = [ contactInfo.country, contactInfo.postalCode ];
	const contactFields = [
		contactInfo.firstName,
		contactInfo.lastName,
		contactInfo.email,
		contactInfo.address,
		contactInfo.city,
		contactInfo.state || contactInfo.province,
		contactInfo.vatId,
	];
	const domainFields = [
		domainContactInfo.firstName,
		domainContactInfo.lastName,
		domainContactInfo.email,
		domainContactInfo.address,
		domainContactInfo.city,
		domainContactInfo.state || domainContactInfo.province,
		domainContactInfo.phoneNumber,
	];
	let allFields = taxFields;
	if ( areDomainsInLineItems ) {
		allFields = allFields.concat( contactFields );
		if ( ! isDomainContactSame ) {
			allFields = allFields.concat( domainFields );
		}
	}

	// Make sure all required fields are filled
	const emptyFields = allFields.filter( value => ! value );
	if ( emptyFields.length > 0 ) {
		return false;
	}
	return true;
}

function isFormEditable( select ) {
	const store = select( 'wpcom' );
	if ( ! store ) {
		return false;
	}
	// FIXME: this needs to return false if the fields have not been touched
	// FIXME: this needs to check only fields that are being displayed; not all fields
	const contactInfo = store.getContactInfo();
	if ( Object.keys( contactInfo ).find( x => x ) ) {
		return true;
	}
	const domainContactInfo = store.getDomainContactInfo();
	if ( Object.keys( domainContactInfo ).find( x => x ) ) {
		return true;
	}
	return false;
}
