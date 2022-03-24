import { getPreference } from 'calypso/state/preferences/selectors';
import { initialCount, PREFERENCE_BASE_NAME, SingleCounterType, CounterType } from './constants';
import { isSameDay } from './helpers';
import type { AppState } from 'calypso/types';

export const getCounterName = (
	state: AppState,
	counterName: string,
	keyedToSiteId = false
): keyof CounterType => {
	if ( keyedToSiteId ) {
		return `${ counterName }-${ state.ui.selectedSiteId }`;
	}
	return counterName;
};

export const getCounter = (
	state: AppState,
	counterName: string,
	keyedToSiteId = false
): SingleCounterType => {
	const keyedCounterName: keyof CounterType = getCounterName( state, counterName, keyedToSiteId );
	const pref = ( getPreference( state, PREFERENCE_BASE_NAME ) as CounterType ) || {};

	return pref[ keyedCounterName ] ?? initialCount;
};

export const lastUpdatedIsToday = (
	state: AppState,
	counterName: string,
	keyedToSiteId = false
): boolean => {
	const thisPref = getCounter( state, counterName, keyedToSiteId );
	const { lastUpdated } = thisPref;
	const lastUpdatedDate = lastUpdated || 0;

	return isSameDay( lastUpdatedDate, Date.now() );
};

export const counterExists = (
	state: AppState,
	counterName: string,
	keyedToSiteId = false
): boolean => {
	const pref = ( getPreference( state, PREFERENCE_BASE_NAME ) as CounterType ) || {};
	const keyedCounterName: keyof CounterType = getCounterName( state, counterName, keyedToSiteId );

	return !! pref[ keyedCounterName ];
};

export const getCount = ( state: AppState, counterName: string, keyedToSiteId = false ): number => {
	const keyedCounterName: keyof CounterType = getCounterName( state, counterName, keyedToSiteId );
	const pref = ( getPreference( state, PREFERENCE_BASE_NAME ) as CounterType ) || {};

	return pref[ keyedCounterName ]?.count;
};
