/** @format */

/**
 * Internal dependencies
 */

import {
	PREVIEW_SITE_SET,
	PREVIEW_TOOL_SET,
	PREVIEW_TYPE_RESET,
	PREVIEW_TYPE_SET,
	PREVIEW_URL_CLEAR,
	PREVIEW_URL_SET,
} from 'state/action-types';

import { clearCustomizations } from 'state/preview/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';

export function setPreviewUrl( url ) {
	return {
		type: PREVIEW_URL_SET,
		url,
	};
}

export function clearPreviewUrl() {
	return {
		type: PREVIEW_URL_CLEAR,
	};
}

export function setPreviewType( previewType ) {
	return {
		type: PREVIEW_TYPE_SET,
		previewType,
	};
}

export function resetPreviewType() {
	return {
		type: PREVIEW_TYPE_RESET,
	};
}

export function setAllSitesPreviewSiteId( siteId ) {
	return {
		type: PREVIEW_SITE_SET,
		siteId,
	};
}

export function closePreview() {
	return ( dispatch, getState ) => {
		const selectedSiteId = getSelectedSiteId( getState() );
		dispatch( clearCustomizations( selectedSiteId ) );
		dispatch( clearPreviewUrl() );
		dispatch( resetPreviewType() );
		dispatch( setLayoutFocus( 'content' ) );
	};
}

export function setActiveDesignTool( id ) {
	return {
		type: PREVIEW_TOOL_SET,
		id,
	};
}
