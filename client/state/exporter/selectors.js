/**
 * Internal dependencies
 */

import { States } from './constants.js';
import { get } from 'lodash';

export const getExportingState = ( state, siteId ) => {
	const exportingState = state.exporter.exportingState;
	if ( ! exportingState[ siteId ] ) {
		return States.READY;
	}
	return exportingState[ siteId ];
};

/**
 * Indicates whether an export activity is in progress.
 *
 * @param  {object} state    Global state tree
 * @param  {number} siteId   The ID of the site to check
 * @returns {boolean}         true if activity is in progress
 */
export function shouldShowProgress( state, siteId ) {
	const exportingState = getExportingState( state, siteId );

	return exportingState === States.STARTING || exportingState === States.EXPORTING;
}

/**
 * Indicates whether the export is in progress on the server
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId The site ID for which to check export progress
 * @returns {boolean}        true if an export is in progress
 */
export function isExporting( state, siteId ) {
	const exportingState = getExportingState( state, siteId );
	return exportingState === States.EXPORTING;
}

export function isDateRangeValid( state, siteId, postType ) {
	const site = state.exporter.selectedAdvancedSettings[ siteId ];
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

export const getAdvancedSettings = ( state, siteId ) => state.exporter.advancedSettings[ siteId ];
export const getSelectedPostType = ( state ) => state.exporter.selectedPostType;
export const getPostTypeFieldOptions = ( state, siteId, postType, fieldName ) => {
	// Choose which set of options to return for the given field name
	const optionSet = get(
		{
			author: 'authors',
			status: 'statuses',
			start_date: 'dates',
			end_date: 'dates',
			category: 'categories',
		},
		fieldName,
		null
	);

	const advancedSettings = getAdvancedSettings( state, siteId );
	if ( ! advancedSettings ) {
		return null;
	}
	const fields = advancedSettings[ postType ];
	if ( ! fields ) {
		return null;
	}
	return fields[ optionSet ] || null;
};

export const getPostTypeFieldValues = ( state, siteId, postType ) => {
	const site = state.exporter.selectedAdvancedSettings[ siteId ];
	if ( ! site ) {
		return null;
	}
	return site[ postType ] || null;
};

export const getPostTypeFieldValue = ( state, siteId, postType, fieldName ) => {
	const fields = getPostTypeFieldValues( state, siteId, postType );
	if ( ! fields ) {
		return null;
	}
	return fields[ fieldName ] || null;
};

/**
 * Prepare currently selected advanced settings for an /exports/start request
 *
 * @param  {object} state  Global state tree
 * @param  {number} siteId The ID of the site
 * @returns {object}        The request body
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
