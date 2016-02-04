import { States } from './constants.js';

/**
 * Indicates whether an export activity is in progress.
 *
 * @param  {Object} state    Global state tree
 * @return {boolean}         true if activity is in progress
 */
export const shouldShowProgress = ( state ) => {
	const exportingState = state.siteSettings.exporter.exportingState;

	return ( exportingState === States.STARTING || exportingState === States.EXPORTING );
}

export const getSelectedPostType = ( state ) => state.siteSettings.exporter.selectedPostType;
export const getExportingState = ( state ) => state.siteSettings.exporter.exportingState;
