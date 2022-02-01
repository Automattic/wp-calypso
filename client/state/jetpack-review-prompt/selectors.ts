import { getPreference } from 'calypso/state/preferences/selectors';
import {
	emptyPreference,
	MAX_DISMISS_COUNT,
	PREFERENCE_NAME,
	PreferenceType,
	TIME_BETWEEN_PROMPTS,
	SinglePreferenceType,
	ScanPreferenceType,
} from './constants';
import type { AppState } from 'calypso/types';

const getExistingPreference = (
	state: AppState,
	type: 'scan' | 'restore'
): SinglePreferenceType => {
	const pref = ( getPreference( state, PREFERENCE_NAME ) as PreferenceType ) || {};
	if ( type === 'scan' && pref?.scan ) {
		const scanKey = state.ui.selectedSiteId as keyof ScanPreferenceType;
		return pref.scan[ scanKey ] ?? emptyPreference;
	}
	return pref.restore ?? emptyPreference;
};

const getIsDismissed = ( state: AppState, type: 'scan' | 'restore' ): boolean => {
	const { dismissCount, dismissedAt, reviewed } = getExistingPreference( state, type );

	if ( reviewed || MAX_DISMISS_COUNT <= dismissCount ) {
		return true;
	}
	return dismissCount > 0 && dismissedAt !== null
		? Date.now() - dismissedAt < TIME_BETWEEN_PROMPTS
		: false;
};

const getIsValid = ( state: AppState, type: 'scan' | 'restore' ): boolean => {
	const { validFrom } = getExistingPreference( state, type );
	return null !== validFrom ? validFrom < Date.now() : false;
};

const getValidFromDate = ( state: AppState, type: 'scan' | 'restore' ): number | null => {
	const { validFrom } = getExistingPreference( state, type );
	return validFrom;
};

export { getIsDismissed, getIsValid, getExistingPreference, getValidFromDate };
