/** @format */

/**
 * External dependencies
 */

import { get, find, has } from 'lodash';

/**
 * Internal dependencies
 */
import { DEFAULT_PREFERENCE_VALUES } from './constants';

export const isFetchingPreferences = state => !! state.preferences.fetching;

/**
 * Returns the preference value associated with the specified key. Attempts to
 * find in local and remote preferences, then any applicable default value,
 * otherwise returning null.
 *
 * @param  {Object} state Global state tree
 * @param  {String} key   Preference key
 * @return {*}            Preference value
 */
export function getPreference( state, key ) {
	return get(
		find(
			[ state.preferences.localValues, state.preferences.remoteValues, DEFAULT_PREFERENCE_VALUES ],
			source => has( source, key )
		),
		key,
		null
	);
}

export const preferencesLastFetchedTimestamp = state => state.preferences.lastFetchedTimestamp;

/**
 * Returns true if preferences have been received from the remote source, or
 * false otherwise.
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean}       Whether preferences have been received
 */
export function hasReceivedRemotePreferences( state ) {
	return !! state.preferences.remoteValues;
}
