/**
 * Internal dependencies
 */
import { PREVIEW_URL_CLEAR, PREVIEW_URL_SET, PREVIEW_TOOL_SET, PREVIEW_TYPE_SET, PREVIEW_TYPE_RESET } from 'state/action-types';
import { clearCustomizations } from 'state/preview/actions';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { getSelectedSiteId } from 'state/ui/selectors';

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
