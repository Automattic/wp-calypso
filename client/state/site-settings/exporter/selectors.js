/**
 * Internal dependencies
 */
import { States } from './constants.js';

/**
 * Indicates whether an export activity is in progress.
 *
 * @param  {Object} state    Global state tree
 * @param  {Number} siteId   The ID of the site to check
 * @return {boolean}         true if activity is in progress
 */
export function shouldShowProgress( state, siteId ) {
	const exportingState = state.siteSettings.exporter.exportingState;
	if ( ! exportingState[ siteId ] ) {
		return false;
	}

	return ( exportingState[ siteId ] === States.STARTING ||
		exportingState[ siteId ] === States.EXPORTING );
}

export const getSelectedPostType = ( state ) => state.siteSettings.exporter.selectedPostType;
export const getExportingState = ( state ) => state.siteSettings.exporter.exportingState;
export const advancedSettings = ( state, siteId ) => state.siteSettings.exporter.advancedSettings[ siteId ];
