/**
 * Internal dependencies
 */
import { savePreference } from 'calypso/state/preferences/actions';
import { PREFERENCE_NAME, PreferenceType } from './constants';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const dismiss = ( previousCount: number ) => {
	return savePreference( PREFERENCE_NAME, {
		dismissedAt: Date.now(),
		dismissCount: previousCount + 1,
		reviewed: false,
	} as PreferenceType );
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const dismissAsReviewed = ( previousCount: number ) => {
	return savePreference( PREFERENCE_NAME, {
		dismissedAt: Date.now(),
		dismissCount: previousCount,
		reviewed: true,
	} as PreferenceType );
};

export { dismiss, dismissAsReviewed };
