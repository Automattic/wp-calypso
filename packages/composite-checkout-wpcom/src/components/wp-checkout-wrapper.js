/**
 * External dependencies
 */
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
	CheckoutProvider,
} from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import WPCheckout from './wp-checkout';

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

// This is the parent component which would be included on a host page
export function WPCheckoutWrapper( { useShoppingCart, availablePaymentMethods, registry } ) {
	const { itemsWithTax, total} = useShoppingCart();

	const { select, subscribe, registerStore } = registry;
	useWpcomStore( registerStore );

	useEffect( () => {
		return subscribe( handleCheckoutEvent( select ) );
	}, [ select, subscribe ] );

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
			<WPCheckout />
		</CheckoutProvider>
	);
}

WPCheckoutWrapper.propTypes = {
	availablePaymentMethods: PropTypes.arrayOf( PropTypes.object ).isRequired,
	useShoppingCart: PropTypes.func.isRequired,
	registry: PropTypes.object.isRequired,
};

function useWpcomStore( registerStore ) {
	// Only register once
	const registerComplete = useRef();
	if ( registerComplete.current ) {
		return;
	}
	registerComplete.current = true;

	const contactDefaults = {
		firstName: { value: '', isTouched: false, isValid: false },
		lastName: { value: '', isTouched: false, isValid: false },
		email: { value: '', isTouched: false, isValid: false },
		phoneNumber: { value: '', isTouched: false, isValid: true },
		address: { value: '', isTouched: false, isValid: false },
		city: { value: '', isTouched: false, isValid: false },
		state: { value: '', isTouched: false, isValid: false },
		province: { value: '', isTouched: false, isValid: false },
		country: { value: '', isTouched: false, isValid: false },
		postalCode: { value: '', isTouched: false, isValid: false },
		vatId: { value: '', isTouched: false, isValid: false },
	};

	function contactReducer( state = contactDefaults, action ) {
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

	const domainContactDefaults = {
		firstName: { value: '', isTouched: false, isValid: false },
		lastName: { value: '', isTouched: false, isValid: false },
		email: { value: '', isTouched: false, isValid: false },
		phoneNumber: { value: '', isTouched: false, isValid: false },
		address: { value: '', isTouched: false, isValid: false },
		city: { value: '', isTouched: false, isValid: false },
		state: { value: '', isTouched: false, isValid: false },
		province: { value: '', isTouched: false, isValid: false },
		country: { value: '', isTouched: false, isValid: false },
		postalCode: { value: '', isTouched: false, isValid: false },
	};

	function domainContactReducer( state = domainContactDefaults, action ) {
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
}
