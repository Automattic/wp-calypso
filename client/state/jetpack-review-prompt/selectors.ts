/**
 * Internal dependencies
 */
import { getPreference } from 'calypso/state/preferences/selectors';
import PREFERENCE_NAME from './constants';

/**
 * Type dependencies
 */
import type { AppState } from 'calypso/types';

const TWO_WEEKS_IN_MS = 1000 * 60 * 60 * 24 * 7 * 2;

const getIsDismissed = ( state: AppState ): boolean => {
	const prefValue = getPreference( state, PREFERENCE_NAME ) as number | 'permanent' | null;
	if ( null === prefValue ) {
		return false;
	}
	return 'number' === typeof prefValue ? Date.now() - prefValue < TWO_WEEKS_IN_MS : true;
};

const getHasBeenDismissedOnce = ( state: AppState ): boolean => {
	const prefValue = getPreference( state, PREFERENCE_NAME ) as number | 'permanent' | null;
	return null !== prefValue;
};

export { getIsDismissed, getHasBeenDismissedOnce };
