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

export function isDateValid( state, siteId, postType ) {
	const site = state.siteSettings.exporter.selectedAdvancedSettings[ siteId ];
	if ( ! site ) {
		return true;
	}
	const values = site[ postType ];
	if ( ! values ) {
		return true;
	}

	const startDate = values.start_date;
	const endDate = values.end_date;
	if ( startDate && endDate && startDate > endDate ) {
		return false;
	}

	return true;
}

export const getAdvancedSettings = ( state, siteId ) => state.siteSettings.exporter.advancedSettings[ siteId ];
export const getSelectedPostType = ( state ) => state.siteSettings.exporter.selectedPostType;
export const getPostTypeFieldOptions = ( state, siteId, postType ) => {
	const advancedSettings = getAdvancedSettings( state, siteId );
	return advancedSettings ? advancedSettings[ postType ] : null;
};

export const getPostTypeFieldValues = ( state, siteId, postType ) => {
	const site = state.siteSettings.exporter.selectedAdvancedSettings[ siteId ];
	return site && site[ postType ] || {};
};

/**
 * Prepare currently selected advanced settings for an /exports/start request
 * @param  {Object} state  Global state tree
 * @param  {number} siteId The ID of the site
 * @return {Object}        The request body
 */
export function prepareExportRequest( state, siteId, { exportAll = true } = {} ) {
	// Request body is empty if we're just exporting everything
	if ( exportAll ) {
		return null;
	}

	const postType = getSelectedPostType( state );
	const selectedFieldValues = getPostTypeFieldValues( state, siteId, postType );
	return Object.assign( { post_type: postType }, selectedFieldValues );
}
