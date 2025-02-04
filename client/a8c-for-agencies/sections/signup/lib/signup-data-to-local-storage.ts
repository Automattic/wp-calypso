import { AgencyDetailsPayload } from '../agency-details-form/types';

const SIGNUP_DATA_KEY = 'a4aSignupFormData';

export function saveSignupDataToLocalStorage( data: AgencyDetailsPayload ) {
	try {
		window.localStorage.setItem( SIGNUP_DATA_KEY, JSON.stringify( data ) );
	} catch ( err ) {
		return [];
	}
}

export function getSignupDataFromLocalStorage(): AgencyDetailsPayload | null {
	try {
		return JSON.parse( window.localStorage.getItem( SIGNUP_DATA_KEY ) || 'null' );
	} catch ( err ) {
		return null;
	}
}

export function clearSignupDataFromLocalStorage(): void {
	try {
		window.localStorage.removeItem( SIGNUP_DATA_KEY );
	} catch ( e ) {
		return;
	}
}
