/** @format */

/**
 * Internal dependencies
 */
import { getPreference, isFetchingPreferences } from 'state/preferences/selectors';

export default {
	useCalypsoStore: true,
	selectors: {
		getPreference,
		isFetchingPreferences,
	},
};
