/**
 * Internal dependencies
 */
import { States } from './constants.js';

export const getExportingState = ( state, siteId ) => {
	const exportingState = state.siteSettings.exporter.exportingState;
	if ( ! exportingState[ siteId ] ) {
		return States.READY;
	}
	return exportingState[ siteId ];
};

/**
 * Indicates whether an export activity is in progress.
 *
 * @param  {Object} state    Global state tree
 * @param  {Number} siteId   The ID of the site to check
 * @return {boolean}         true if activity is in progress
 */
export function shouldShowProgress( state, siteId ) {
	const exportingState = getExportingState( state, siteId );

	return ( exportingState === States.STARTING ||
		exportingState === States.EXPORTING );
}

/**
 * Indicates whether the export is in progress on the server
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId The site ID for which to check export progress
 * @return {Boolean}        true if an export is in progress
 */
export function isExporting( state, siteId ) {
	const exportingState = getExportingState( state, siteId );
	return exportingState === States.EXPORTING;
}

export const getAdvancedSettings = ( state, siteId ) => state.siteSettings.exporter.advancedSettings[ siteId ];
export const getSelectedPostType = ( state ) => state.siteSettings.exporter.selectedPostType;
export const getPostTypeOptions = ( state, siteId, postType ) => {
	const advancedSettings = getAdvancedSettings( state, siteId );
	return advancedSettings ? advancedSettings[ postType ] : null;
};

export const getPostTypeValues = ( state, siteId, postType ) => {
	const site = state.siteSettings.exporter.selectedAdvancedSettings[ siteId ];
	return site && site[ postType ] || {};
};
