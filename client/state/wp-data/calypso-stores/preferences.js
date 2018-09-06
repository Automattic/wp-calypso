/** @format */

/**
 * Internal dependencies
 */
import { fetchPreferences, setPreference, savePreference } from 'state/preferences/actions';
import { getPreference, isFetchingPreferences } from 'state/preferences/selectors';

export default {
	selectors: {
		getPreference,
		isFetchingPreferences,
	},
	actions: {
		fetchPreferences,
		setPreference,
		savePreference,
	},
};
