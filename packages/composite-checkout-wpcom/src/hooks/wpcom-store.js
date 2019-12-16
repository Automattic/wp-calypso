/**
 * External dependencies
 */
import { useRef } from 'react';

export function useWpcomStore( registerStore ) {
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
		country: { value: '', isTouched: false, isValid: false },
		postalCode: { value: '', isTouched: false, isValid: false },
		vatId: { value: '', isTouched: false, isValid: false },
	};

	function contactReducer( state = contactDefaults, action ) {
		switch ( action.type ) {
			case 'CONTACT_SET_FIELD':
				return { ...state, [ action.payload.key ]: action.payload.field };
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
		country: { value: '', isTouched: false, isValid: false },
		postalCode: { value: '', isTouched: false, isValid: false },
	};

	function domainContactReducer( state = domainContactDefaults, action ) {
		switch ( action.type ) {
			case 'CONTACT_SET_DOMAIN_FIELD':
				return { ...state, [ action.payload.key ]: action.payload.field };
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

	function siteIdReducer( state = null, action ) {
		switch ( action.type ) {
			case 'SET_SITE_ID':
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
				siteId: siteIdReducer( state.siteId, action ),
			};
		},

		actions: {
			setSiteId( payload ) {
				return { type: 'SET_SITE_ID', payload };
			},

			setIsDomainContactSame( payload ) {
				return { type: 'CONTACT_SET_DOMAIN_SAME', payload };
			},

			setContactField( key, field ) {
				return { type: 'CONTACT_SET_FIELD', payload: { key, field } };
			},
			setVatId( payload ) {
				return { type: 'CONTACT_SET_FIELD', payload: { key: 'vatId', payload } };
			},

			setDomainContactField( key, field ) {
				return { type: 'CONTACT_SET_DOMAIN_FIELD', payload: { key, field } };
			},
		},

		selectors: {
			getSiteId( state ) {
				return state.siteId;
			},

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
					country: state.domainContact.country,
					postalCode: state.domainContact.postalCode,
					phoneNumber: state.domainContact.phoneNumber,
					vatId: state.contact.vatId, // There is only one vatId
				};
			},
		},
	} );
}
