import { getPreference } from 'calypso/state/preferences/selectors';
import { PREFERENCE_BASE_NAME, CounterType, initialCount } from './constants';
import { getCounter, getCounterName } from './selectors';
import type { AppState } from 'calypso/types';

export const isSameDay = ( unixTimestamp1: number, unixTimestamp2: number ): boolean => {
	const millisecondsInDay = 24 * 60 * 60 * 1000;
	return (
		Math.floor( unixTimestamp1 / millisecondsInDay ) ===
		Math.floor( unixTimestamp2 / millisecondsInDay )
	);
};

export const incrementPreference = (
	state: AppState,
	counterName: string,
	keyedToSiteId = false
): CounterType => {
	const fullPref = getPreference( state, PREFERENCE_BASE_NAME ) ?? {};
	const thisCounter = getCounter( state, counterName, keyedToSiteId );
	const keyedCounterName = getCounterName( state, counterName, keyedToSiteId );

	return {
		...fullPref,
		[ keyedCounterName ]: {
			count: thisCounter.count + 1,
			lastUpdated: Date.now(),
		},
	};
};

export const decrementPreference = (
	state: AppState,
	counterName: string,
	keyedToSiteId = false
): CounterType => {
	const fullPref = getPreference( state, PREFERENCE_BASE_NAME ) ?? {};
	const thisCounter = getCounter( state, counterName, keyedToSiteId );
	const keyedCounterName = getCounterName( state, counterName, keyedToSiteId );

	return {
		...fullPref,
		[ keyedCounterName ]: {
			count: thisCounter.count <= 0 ? 0 : thisCounter.count - 1,
			lastUpdated: Date.now(),
		},
	};
};

export const resetPreference = (
	state: AppState,
	counterName: string,
	keyedToSiteId = false
): CounterType => {
	const fullPref = getPreference( state, PREFERENCE_BASE_NAME ) ?? {};
	const keyedCounterName = getCounterName( state, counterName, keyedToSiteId );

	return {
		...fullPref,
		[ keyedCounterName ]: {
			...initialCount,
		},
	};
};
