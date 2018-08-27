/** @format */

/**
 * External dependencies
 */

import { get, find, has } from 'lodash';

/**
 * Internal dependencies
 */
import { DEFAULT_PREFERENCE_VALUES } from './constants';

export const isFetchingPreferences = state => !! state.fetching;

/**
 * Returns the preference value associated with the specified key. Attempts to
 * find in local and remote preferences, then any applicable default value,
 * otherwise returning null.
 *
 * @param  {Object} state Preferences state tree
 * @param  {String} key   Preference key
 * @return {*}            Preference value
 */
export function getPreference( state, key ) {
	return get(
		find( [ state.localValues, state.remoteValues, DEFAULT_PREFERENCE_VALUES ], source =>
			has( source, key )
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
 * @param  {Object} state Preferences state tree
 * @return {Object}       Preference value
 */
export function getAllRemotePreferences( state ) {
	return state.remoteValues;
}

export const preferencesLastFetchedTimestamp = state => state.lastFetchedTimestamp;

/**
 * Returns true if preferences have been received from the remote source, or
 * false otherwise.
 *
 * @param  {Object}  state Preferences state tree
 * @return {Boolean}       Whether preferences have been received
 */
export function hasReceivedRemotePreferences( state ) {
	return !! state.remoteValues;
}
