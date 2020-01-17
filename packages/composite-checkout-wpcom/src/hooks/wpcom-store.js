/**
 * External dependencies
 */
import { useRef } from 'react';

export function useWpcomStore( registerStore, onEvent ) {
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
		phoneNumberCountry: { value: '', isTouched: false, isValid: true },
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
				contact: contactReducer( state.contact, action ),
				siteId: siteIdReducer( state.siteId, action ),
			};
		},

		actions: {
			setSiteId( payload ) {
				return { type: 'SET_SITE_ID', payload };
			},

			setContactField( key, field ) {
				if ( ! field.isValid ) {
					onEvent( {
						type: 'a8c_checkout_error',
						payload: {
							type: 'Field error',
							field: key,
						},
					} );
				}
				return { type: 'CONTACT_SET_FIELD', payload: { key, field } };
			},

			setVatId( payload ) {
				return { type: 'CONTACT_SET_FIELD', payload: { key: 'vatId', payload } };
			},
		},

		selectors: {
			getSiteId( state ) {
				return state.siteId;
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
					phoneNumberCountry: state.contact.phoneNumberCountry,
					vatId: state.contact.vatId,
				};
			},
		},
	} );
}
