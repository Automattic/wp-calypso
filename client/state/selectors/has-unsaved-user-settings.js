/**
 * External dependencies
 */
import { get, isEmpty } from 'lodash';

/**
 * Check if there are any unsaved settings
 *
 * @param  {Object} state Global state tree
 * @return {Boolean} are there any unsaved settings?
 */
export default function hasUnsavedUserSettings( state ) {
	return ! isEmpty( get( state, 'userSettings.unsavedSettings' ) );
}
