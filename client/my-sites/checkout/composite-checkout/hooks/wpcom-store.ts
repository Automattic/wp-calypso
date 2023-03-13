import { registerStore } from '@wordpress/data';
import { useRef } from 'react';
import {
	emptyManagedContactDetails,
	getInitialWpcomStoreState,
	managedContactDetailsUpdaters as updaters,
} from '../types/wpcom-store-state';
import type { DispatchFromMap, SelectFromMap } from '@automattic/data-stores';
import type { DomainContactDetails } from '@automattic/shopping-cart';
import type {
	PossiblyCompleteDomainContactDetails,
	WpcomStoreState,
	ManagedContactDetails,
	ManagedContactDetailsErrors,
	VatDetails,
} from '@automattic/wpcom-checkout';

type WpcomStoreAction =
	| {
			type: 'APPLY_DOMAIN_CONTACT_VALIDATION_RESULTS';
			payload: ManagedContactDetailsErrors;
	  }
	| { type: 'UPDATE_TAX_FIELDS'; payload: ManagedContactDetails }
	| { type: 'UPDATE_DOMAIN_CONTACT_FIELDS'; payload: DomainContactDetails }
	| { type: 'SET_RECAPTCHA_CLIENT_ID'; payload: number }
	| { type: 'UPDATE_VAT_ID'; payload: string }
	| { type: 'UPDATE_EMAIL'; payload: string }
	| { type: 'UPDATE_PHONE'; payload: string }
	| { type: 'UPDATE_PHONE_NUMBER_COUNTRY'; payload: string }
	| { type: 'UPDATE_POSTAL_CODE'; payload: string }
	| { type: 'TOUCH_CONTACT_DETAILS' }
	| { type: 'CLEAR_DOMAIN_CONTACT_ERROR_MESSAGES' }
	| { type: 'UPDATE_COUNTRY_CODE'; payload: string }
	| { type: 'LOAD_COUNTRY_CODE_FROM_GEOIP'; payload: string }
	| {
			type: 'LOAD_DOMAIN_CONTACT_DETAILS_FROM_CACHE';
			payload: PossiblyCompleteDomainContactDetails;
	  }
	| { type: 'SET_VAT_DETAILS'; payload: VatDetails };

export const STORE_KEY = 'wpcom-checkout';

export interface WpcomCheckoutStore extends ReturnType< typeof registerStore > {
	getState: () => WpcomStoreState;
}

export type WpcomCheckoutStoreSelectors = SelectFromMap< typeof selectors >;
export type WpcomCheckoutStoreActions = DispatchFromMap< typeof actions >;

const actions = {
	applyDomainContactValidationResults( payload: ManagedContactDetailsErrors ): WpcomStoreAction {
		return { type: 'APPLY_DOMAIN_CONTACT_VALIDATION_RESULTS', payload };
	},

	clearDomainContactErrorMessages(): WpcomStoreAction {
		return { type: 'CLEAR_DOMAIN_CONTACT_ERROR_MESSAGES' };
	},

	setRecaptchaClientId( payload: number ): WpcomStoreAction {
		return { type: 'SET_RECAPTCHA_CLIENT_ID', payload };
	},

	updateTaxFields( payload: ManagedContactDetails ): WpcomStoreAction {
		return { type: 'UPDATE_TAX_FIELDS', payload };
	},

	updateDomainContactFields( payload: DomainContactDetails ): WpcomStoreAction {
		return { type: 'UPDATE_DOMAIN_CONTACT_FIELDS', payload };
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

	updateEmail( payload: string ): WpcomStoreAction {
		return { type: 'UPDATE_EMAIL', payload };
	},

	updateCountryCode( payload: string ): WpcomStoreAction {
		return { type: 'UPDATE_COUNTRY_CODE', payload };
	},

	touchContactFields(): WpcomStoreAction {
		return { type: 'TOUCH_CONTACT_DETAILS' };
	},

	updateVatId( payload: string ): WpcomStoreAction {
		return { type: 'UPDATE_VAT_ID', payload: payload };
	},

	loadCountryCodeFromGeoIP( payload: string ): WpcomStoreAction {
		return { type: 'LOAD_COUNTRY_CODE_FROM_GEOIP', payload };
	},

	loadDomainContactDetailsFromCache(
		payload: PossiblyCompleteDomainContactDetails
	): WpcomStoreAction {
		return { type: 'LOAD_DOMAIN_CONTACT_DETAILS_FROM_CACHE', payload };
	},

	setVatDetails( payload: VatDetails ): WpcomStoreAction {
		return { type: 'SET_VAT_DETAILS', payload };
	},
};

const selectors = {
	getContactInfo( state: WpcomStoreState ): ManagedContactDetails {
		return state.contactDetails;
	},

	getRecaptchaClientId( state: WpcomStoreState ): number {
		return state.recaptchaClientId;
	},

	getVatDetails( state: WpcomStoreState ): VatDetails | undefined {
		return state.vatDetails;
	},
};

export function useWpcomStore(): WpcomCheckoutStore | undefined {
	// Only register once
	const registerIsComplete = useRef< boolean >( false );
	if ( registerIsComplete.current ) {
		return undefined;
	}
	registerIsComplete.current = true;

	function contactReducer(
		state: ManagedContactDetails,
		action: WpcomStoreAction
	): ManagedContactDetails {
		switch ( action.type ) {
			case 'UPDATE_DOMAIN_CONTACT_FIELDS': {
				return updaters.updateDomainContactFields( state, action.payload );
			}
			case 'UPDATE_TAX_FIELDS':
				return updaters.updateTaxFields( state, action.payload );
			case 'UPDATE_VAT_ID':
				return updaters.updateVatId( state, action.payload );
			case 'UPDATE_PHONE':
				return updaters.updatePhone( state, action.payload );
			case 'UPDATE_PHONE_NUMBER_COUNTRY':
				return updaters.updatePhoneNumberCountry( state, action.payload );
			case 'UPDATE_POSTAL_CODE':
				return updaters.updatePostalCode( state, action.payload );
			case 'UPDATE_EMAIL':
				return updaters.updateEmail( state, action.payload );
			case 'UPDATE_COUNTRY_CODE':
				return updaters.updateCountryCode( state, action.payload );
			case 'APPLY_DOMAIN_CONTACT_VALIDATION_RESULTS':
				return updaters.setErrorMessages( state, action.payload );
			case 'CLEAR_DOMAIN_CONTACT_ERROR_MESSAGES':
				return updaters.clearErrorMessages( state );
			case 'TOUCH_CONTACT_DETAILS':
				return updaters.touchContactFields( state );
			case 'LOAD_COUNTRY_CODE_FROM_GEOIP':
				return updaters.populateCountryCodeFromGeoIP( state, action.payload );
			case 'LOAD_DOMAIN_CONTACT_DETAILS_FROM_CACHE':
				return updaters.populateDomainFieldsFromCache( state, action.payload );
			default:
				return state;
		}
	}

	function recaptchaClientIdReducer( state: number, action: WpcomStoreAction ): number {
		switch ( action.type ) {
			case 'SET_RECAPTCHA_CLIENT_ID':
				return action.payload;
			default:
				return state;
		}
	}

	function vatDetailsReducer( state: VatDetails, action: WpcomStoreAction ): VatDetails {
		switch ( action.type ) {
			case 'SET_VAT_DETAILS':
				return action.payload;
			default:
				return state;
		}
	}

	return registerStore( STORE_KEY, {
		reducer( state: WpcomStoreState | undefined, action: WpcomStoreAction ): WpcomStoreState {
			const checkedState =
				state === undefined ? getInitialWpcomStoreState( emptyManagedContactDetails ) : state;
			return {
				contactDetails: contactReducer( checkedState.contactDetails, action ),
				recaptchaClientId: recaptchaClientIdReducer( checkedState.recaptchaClientId, action ),
				vatDetails: vatDetailsReducer( checkedState.vatDetails, action ),
			};
		},
		actions,
		selectors,
	} );
}
