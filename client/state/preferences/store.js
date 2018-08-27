/** @format */

/**
 * Internal dependencies
 */
import reducer from './reducer';
import { fetchPreferences, setPreference, savePreference } from './actions';
import { getPreference, isFetchingPreferences } from './selectors';

export default {
	reducer,
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
