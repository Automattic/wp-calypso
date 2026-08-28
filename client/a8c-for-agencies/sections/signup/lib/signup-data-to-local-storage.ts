import { AgencyDetailsPayload } from '../agency-details-form/types';

const SIGNUP_DATA_KEY = 'a4aSignupFormData';
const ACQUISITION_PROPS_KEY = 'a4aSignupAcquisitionProps';

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
		window.localStorage.removeItem( ACQUISITION_PROPS_KEY );
	} catch ( e ) {
		return;
	}
}

// Kept in their own key so they stay out of the signup payload we POST:
// they are only ever used as Tracks properties.
export function saveAcquisitionPropsToLocalStorage( props: Record< string, string > ): void {
	try {
		window.localStorage.setItem( ACQUISITION_PROPS_KEY, JSON.stringify( props ) );
	} catch ( err ) {
		return;
	}
}

export function getAcquisitionPropsFromLocalStorage(): Record< string, string > {
	try {
		return JSON.parse( window.localStorage.getItem( ACQUISITION_PROPS_KEY ) || '{}' );
	} catch ( err ) {
		return {};
	}
}
