/**
 * External dependencies
 */
import { useRef } from 'react';

/**
 * Internal dependencies
 */
import {
	WpcomStoreState,
	getInitialWpcomStoreState,
	DomainContactDetails,
	ManagedContactDetails,
	ManagedContactDetailsErrors,
	managedContactDetailsUpdaters as updaters,
} from '../types';

type WpcomStoreAction =
	| {
			type: 'APPLY_DOMAIN_CONTACT_VALIDATION_RESULTS';
			payload: ManagedContactDetailsErrors;
	  }
	| { type: 'UPDATE_CONTACT_DETAILS'; payload: DomainContactDetails }
	| { type: 'SET_SITE_ID'; payload: string }
	| { type: 'TRANSACTION_COMPLETE'; payload: object }
	| { type: 'UPDATE_VAT_ID'; payload: string }
	| { type: 'UPDATE_PHONE'; payload: string }
	| { type: 'UPDATE_PHONE_NUMBER_COUNTRY'; payload: string }
	| { type: 'UPDATE_POSTAL_CODE'; payload: string }
	| { type: 'UPDATE_COUNTRY_CODE'; payload: string };

export function useWpcomStore(
	registerStore,
	onEvent,
	managedContactDetails: ManagedContactDetails
) {
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
			case 'UPDATE_PHONE_NUMBER_COUNTRY':
				return updaters.updatePhoneNumberCountry( state, action.payload );
			case 'UPDATE_POSTAL_CODE':
				return updaters.updatePostalCode( state, action.payload );
			case 'UPDATE_COUNTRY_CODE':
				return updaters.updateCountryCode( state, action.payload );
			case 'APPLY_DOMAIN_CONTACT_VALIDATION_RESULTS':
				return updaters.setErrorMessages( state, action.payload );
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

	function transactionResultReducer( state: object, action: WpcomStoreAction ): object {
		switch ( action.type ) {
			case 'TRANSACTION_COMPLETE':
				return action.payload;
			default:
				return state;
		}
	}

	registerStore( 'wpcom', {
		reducer( state: WpcomStoreState | undefined, action: WpcomStoreAction ): WpcomStoreState {
			const checkedState =
				state === undefined ? getInitialWpcomStoreState( managedContactDetails ) : state;
			return {
				contactDetails: contactReducer( checkedState.contactDetails, action ),
				siteId: siteIdReducer( checkedState.siteId, action ),
				transactionResult: transactionResultReducer( checkedState.transactionResult, action ),
			};
		},

		actions: {
			applyDomainContactValidationResults(
				payload: ManagedContactDetailsErrors
			): WpcomStoreAction {
				return { type: 'APPLY_DOMAIN_CONTACT_VALIDATION_RESULTS', payload };
			},

			setSiteId( payload: string ): WpcomStoreAction {
				return { type: 'SET_SITE_ID', payload };
			},

			setTransactionResponse( payload: object ): WpcomStoreAction {
				return { type: 'TRANSACTION_COMPLETE', payload };
			},

			updateContactDetails( payload: DomainContactDetails ): WpcomStoreAction {
				return { type: 'UPDATE_CONTACT_DETAILS', payload };
			},

			updatePhone( payload: string ): WpcomStoreAction {
				return { type: 'UPDATE_PHONE', payload };
			},

			updatePhoneNumberCountry( payload: string ): WpcomStoreAction {
				return { type: 'UPDATE_PHONE_NUMBER_COUNTRY', payload };
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

			getTransactionResult( state: WpcomStoreState ): object {
				return state.transactionResult;
			},

			getContactInfo( state: WpcomStoreState ): ManagedContactDetails {
				return state.contactDetails;
			},
		},
	} );
}
