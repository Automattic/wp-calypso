/**
 * External dependencies
 */
import get from 'lodash/get';

function getPreviewDataForSite( state, siteId ) {
	return get( state, [ 'preview', siteId ], {} );
}

export function getPreviewMarkup( site, siteId ) {
	return getPreviewDataForSite( site, siteId ).previewMarkup;
}

export function getPreviewCustomizations( site, siteId ) {
	return getPreviewDataForSite( site, siteId ).customizations;
}

export function isPreviewUnsaved( site, siteId ) {
	return getPreviewDataForSite( site, siteId ).isUnsaved;
}
