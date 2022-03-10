import { savePreference } from 'calypso/state/preferences/actions';
import { PREFERENCE_BASE_NAME } from './constants';
import { incrementPreference, decrementPreference, resetPreference } from './helpers';
import { lastUpdatedIsToday, counterExists } from './selectors';
import type { CalypsoDispatch } from '../types';
import type { AppState } from 'calypso/types';

export const incrementCounter = (
	counterName: string,
	keyedToSiteId = false,
	countSameDay = true
) => ( dispatch: CalypsoDispatch, getState: () => AppState ) => {
	if ( ! countSameDay && lastUpdatedIsToday( getState(), counterName, keyedToSiteId ) ) {
		return;
	}

	dispatch(
		savePreference(
			PREFERENCE_BASE_NAME,
			incrementPreference( getState(), counterName, keyedToSiteId )
		)
	);
};

export const decrementCounter = (
	counterName: string,
	keyedToSiteId = false,
	countSameDay = true
) => ( dispatch: CalypsoDispatch, getState: () => AppState ) => {
	if ( ! countSameDay && lastUpdatedIsToday( getState(), counterName, keyedToSiteId ) ) {
		return;
	}

	dispatch(
		savePreference(
			PREFERENCE_BASE_NAME,
			decrementPreference( getState(), counterName, keyedToSiteId )
		)
	);
};

export const resetCounter = ( counterName: string, keyedToSiteId = false ) => (
	dispatch: CalypsoDispatch,
	getState: () => AppState
) => {
	if ( ! counterExists( getState(), counterName, keyedToSiteId ) ) {
		return;
	}

	dispatch(
		savePreference(
			PREFERENCE_BASE_NAME,
			resetPreference( getState(), counterName, keyedToSiteId )
		)
	);
};
