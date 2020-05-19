/**
 * Internal dependencies
 */

import { PREVIEW_SITE_SET, PREVIEW_URL_CLEAR, PREVIEW_URL_SET } from 'state/action-types';
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

export function setAllSitesPreviewSiteId( siteId ) {
	return {
		type: PREVIEW_SITE_SET,
		siteId,
	};
}

export function closePreview() {
	return ( dispatch ) => {
		dispatch( clearPreviewUrl() );
		dispatch( setLayoutFocus( 'content' ) );
	};
}
