import { DEFAULT_PREFERENCE_VALUES } from './constants';

import 'calypso/state/preferences/init';

export const isFetchingPreferences = ( state ) => !! state.preferences.fetching;
export const isSavingPreference = ( state ) => !! state.preferences.saving;

/**
 * Returns the preference value associated with the specified key. Attempts to
 * find in local and remote preferences, then any applicable default value,
 * otherwise returning null.
 *
 * @param  {Object} state Global state tree
 * @param  {string} key   Preference key
 * @returns {*}            Preference value
 */
export function getPreference( state, key ) {
	for ( const source of [
		state.preferences?.localValues,
		state.preferences?.remoteValues,
		DEFAULT_PREFERENCE_VALUES,
	] ) {
		if ( source && source.hasOwnProperty( key ) ) {
			return source[ key ] ?? null;
		}
	}
	return null;
}

/**
 * Returns the a key value store of all current remote preferences. The keys
 * of the object are each preference key and the values are the preference
 * values.
 *
 * @param  {Object} state Global state tree
 * @returns {Object}       Preference value
 */
export function getAllRemotePreferences( state ) {
	return state.preferences.remoteValues;
}

export const preferencesLastFetchedTimestamp = ( state ) => state.preferences.lastFetchedTimestamp;

/**
 * Returns true if preferences have been received from the remote source, or
 * false otherwise.
 *
 * @param  {Object}  state Global state tree
 * @returns {boolean}       Whether preferences have been received
 */
export function hasReceivedRemotePreferences( state ) {
	return !! state.preferences.remoteValues;
}
