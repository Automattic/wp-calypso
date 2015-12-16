/**
 * Internal dependencies
 */
import {
	TOGGLE_EXPORTER_ADVANCED_SETTINGS,
	TOGGLE_EXPORTER_SECTION
} from 'state/action-types';

/**
 * Toggle the visibility of the Advanced Settings panel
 * @return {Function}        Action object
 */
export function toggleAdvancedSettings() {
	return {
		type: TOGGLE_EXPORTER_ADVANCED_SETTINGS
	};
}

/**
 * Toggles whether a section of the export is enabled.
 *
 * @param  {Object} section   The name of the section to toggle - 'posts', 'pages', or 'feedback'
 * @return {Object}           Action object
 */
export function toggleSection( section ) {
	return {
		type: TOGGLE_EXPORTER_SECTION,
		section
	};
}
