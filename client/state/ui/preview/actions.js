/**
 * Internal dependencies
 */
import {
	PREVIEW_URL_CLEAR,
	PREVIEW_URL_SET,
	PREVIEW_TYPE_SET,
	PREVIEW_TYPE_RESET,
} from 'state/action-types';

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
