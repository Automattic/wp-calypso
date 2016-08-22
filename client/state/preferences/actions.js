/**
 * Internal dependencies
 */
import { requestCurrentUserSettings, saveUserSettings } from 'state/current-user/settings/actions';
import { PREFERENCES_SET } from 'state/action-types';
import { USER_SETTING_KEY } from './constants';

/**
 * Returns an action thunk that fetches all preferences
 *
 * @return {Function} Action thunk
 */
export const fetchPreferences = () => requestCurrentUserSettings();

/**
 * Returns an action object that is used to signal storing a user preference for the _current_ page load.
 * This is not to be confused with the `savePreference` action which will eventually store these values
 * on the setting endpoint.
 * @param   { String | Number }               key User preference key
 * @param   { String | Number | Object }      value User preference value
 * @returns { Object }                        Action object
 */
export const setPreference = ( key, value ) => ( {
	type: PREFERENCES_SET,
	key,
	value
} );

/**
 * Returns an action thunk that stores a preference and saves it to API.
 * @param   { String | Number }               key User preference key
 * @param   { String | Number | Object }      value User preference value
 * @returns { Function }                      Action thunk
 */
export const savePreference = ( key, value ) => dispatch => {
	dispatch( setPreference( key, value ) );
	dispatch( saveUserSettings( {
		[ USER_SETTING_KEY ]: JSON.stringify( {
			[ key ]: value
		} )
	} ) );
};
