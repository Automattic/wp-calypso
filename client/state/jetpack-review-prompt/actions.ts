/**
 * Internal dependencies
 */
import { savePreference } from 'calypso/state/preferences/actions';
import { PREFERENCE_NAME, PreferenceType } from './constants';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const dismiss = ( previousCount: number, validFrom: number | null = null ) => {
	return savePreference( PREFERENCE_NAME, {
		dismissedAt: Date.now(),
		dismissCount: previousCount + 1,
		reviewed: false,
		validFrom,
	} as PreferenceType );
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const dismissAsReviewed = ( previousCount: number, validFrom: number | null = null ) => {
	return savePreference( PREFERENCE_NAME, {
		dismissedAt: Date.now(),
		dismissCount: previousCount,
		reviewed: true,
		validFrom,
	} as PreferenceType );
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const setValidFrom = ( validFrom: number | null = null ) => {
	return savePreference( PREFERENCE_NAME, {
		dismissedAt: null,
		dismissCount: 0,
		reviewed: true,
		validFrom: validFrom ?? Date.now(),
	} as PreferenceType );
};

export { dismiss, dismissAsReviewed, setValidFrom };
