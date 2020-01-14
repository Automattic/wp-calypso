/**
 * External dependencies
 */
import { useRef } from 'react';

/**
 * Internal dependencies
 */
import {
	WpcomStoreState,
	initialWpcomStoreState,
	DomainContactDetails,
	ManagedContactDetails,
	managedContactDetailsUpdaters as updaters,
} from '../types';

type WpcomStoreAction =
	| {
			type: 'APPLY_DOMAIN_CONTACT_VALIDATION_RESULTS';
			payload: any;
	  }
	| { type: 'UPDATE_CONTACT_DETAILS'; payload: DomainContactDetails }
	| { type: 'SET_SITE_ID'; payload: string }
	| { type: 'UPDATE_VAT_ID'; payload: string }
	| { type: 'UPDATE_PHONE'; payload: string }
	| { type: 'UPDATE_POSTAL_CODE'; payload: string }
	| { type: 'UPDATE_COUNTRY_CODE'; payload: string };

export function useWpcomStore( registerStore, onEvent ) {
	// Only register once
	const registerIsComplete = useRef< boolean >( false );
	if ( registerIsComplete.current ) {
		return;
	}
	registerIsComplete.current = true;

	function contactReducer(
		state: ManagedContactDetails,
		action: WpcomStoreAction
	): ManagedContactDetails {
		switch ( action.type ) {
			case 'UPDATE_CONTACT_DETAILS':
				return updaters.updateDomainFields( state, action.payload );
			case 'UPDATE_VAT_ID':
				return updaters.updateVatId( state, action.payload );
			case 'UPDATE_PHONE':
				return updaters.updatePhone( state, action.payload );
			case 'UPDATE_POSTAL_CODE':
				return updaters.updatePostalCode( state, action.payload );
			case 'UPDATE_COUNTRY_CODE':
				return updaters.updateCountryCode( state, action.payload );
			default:
				return state;
		}
	}

	function siteIdReducer( state: string, action: WpcomStoreAction ): string {
		switch ( action.type ) {
			case 'SET_SITE_ID':
				return action.payload;
			default:
				return state;
		}
	}

	registerStore( 'wpcom', {
		reducer( state: WpcomStoreState | null, action: WpcomStoreAction ): WpcomStoreState {
			const checkedState = state === null ? initialWpcomStoreState : state;
			return {
				contactDetails: contactReducer( checkedState.contactDetails, action ),
				siteId: siteIdReducer( checkedState.siteId, action ),
			};
		},

		actions: {
			applyDomainContactValidationResults(
				payload: any // TODO figure out what this should be
			): WpcomStoreAction {
				return { type: 'APPLY_DOMAIN_CONTACT_VALIDATION_RESULTS', payload };
			},

			setSiteId( payload: string ): WpcomStoreAction {
				return { type: 'SET_SITE_ID', payload };
			},

			updateContactDetails( payload: DomainContactDetails ): WpcomStoreAction {
				return { type: 'UPDATE_CONTACT_DETAILS', payload };
			},

			updatePhone( payload: string ): WpcomStoreAction {
				return { type: 'UPDATE_PHONE', payload };
			},

			updatePostalCode( payload: string ): WpcomStoreAction {
				return { type: 'UPDATE_POSTAL_CODE', payload };
			},

			updateCountryCode( payload: string ): WpcomStoreAction {
				return { type: 'UPDATE_COUNTRY_CODE', payload };
			},

			// TODO: type this; need to use error messages from contact form
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

			updateVatId( payload: string ): WpcomStoreAction {
				return { type: 'UPDATE_VAT_ID', payload: payload };
			},
		},

		selectors: {
			getSiteId( state: WpcomStoreState ): string {
				return state.siteId;
			},

			getContactInfo( state: WpcomStoreState ): ManagedContactDetails {
				return state.contact;
			},
		},
	} );
}
