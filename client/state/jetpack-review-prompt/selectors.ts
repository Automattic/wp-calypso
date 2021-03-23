/**
 * Internal dependencies
 */
import { getPreference } from 'calypso/state/preferences/selectors';
import {
	emptyPreference,
	MAX_DISMISS_COUNT,
	PREFERENCE_NAME,
	PreferenceType,
	TIME_BETWEEN_PROMPTS,
} from './constants';

/**
 * Type dependencies
 */
import type { AppState } from 'calypso/types';

const getDismissCount = ( state: AppState ): number => {
	const preference =
		( getPreference( state, PREFERENCE_NAME ) as PreferenceType ) || emptyPreference;
	return preference.dismissCount;
};

const getIsDismissed = ( state: AppState ): boolean => {
	const { dismissCount, dismissedAt, reviewed } =
		( getPreference( state, PREFERENCE_NAME ) as PreferenceType ) || emptyPreference;

	if ( reviewed || MAX_DISMISS_COUNT <= dismissCount ) {
		return true;
	}
	return dismissCount > 0 && dismissedAt !== null
		? Date.now() - dismissedAt < TIME_BETWEEN_PROMPTS
		: false;
};

export { getDismissCount, getIsDismissed };
