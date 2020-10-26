/**
 * Internal dependencies
 */
import 'calypso/state/imports/init';

export function getUploadFilename( state ) {
	return state.imports.uploads?.filename;
}

export function getUploadPercentComplete( state ) {
	return state.imports.uploads?.percentComplete;
}

export function isUploading( state ) {
	return state.imports.uploads?.inProgress;
}
