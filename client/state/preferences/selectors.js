/**
 * External dependencies
 */

import { get, find, has } from 'lodash';

/**
 * Internal dependencies
 */
import { DEFAULT_PREFERENCE_VALUES } from './constants';

export const isFetchingPreferences = ( state ) => !! state.preferences.fetching;

/**
 * Returns the preference value associated with the specified key. Attempts to
 * find in local and remote preferences, then any applicable default value,
 * otherwise returning null.
 *
 * @param  {object} state Global state tree
 * @param  {string} key   Preference key
 * @returns {*}            Preference value
 */
export function getPreference( state, key ) {
	return get(
		find(
			[ state.preferences.localValues, state.preferences.remoteValues, DEFAULT_PREFERENCE_VALUES ],
			( source ) => has( source, key )
		),
		key,
		null
	);
}

/**
 * Returns the a key value store of all current remote preferences. The keys
 * of the object are each preference key and the values are the preference
 * values.
 *
 * @param  {object} state Global state tree
 * @returns {object}       Preference value
 */
export function getAllRemotePreferences( state ) {
	return state.preferences.remoteValues;
}

export const preferencesLastFetchedTimestamp = ( state ) => state.preferences.lastFetchedTimestamp;

/**
 * Returns true if preferences have been received from the remote source, or
 * false otherwise.
 *
 * @param  {object}  state Global state tree
 * @returns {boolean}       Whether preferences have been received
 */
export function hasReceivedRemotePreferences( state ) {
	return !! state.preferences.remoteValues;
}
