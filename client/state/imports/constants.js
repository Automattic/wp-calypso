/** @format */
export const appStates = Object.freeze( {
	CANCEL_PENDING: 'importer-canceling',
	DEFUNCT: 'importer-defunct',
	DISABLED: 'importer-disabled',
	EXPIRE_PENDING: 'importer-expire-pending',
	IMPORT_FAILURE: 'importer-import-failure',
	IMPORT_SUCCESS: 'importer-import-success',
	IMPORTING: 'importer-importing',
	INACTIVE: 'importer-inactive',
	MAP_AUTHORS: 'importer-map-authors',
	READY_FOR_UPLOAD: 'importer-ready-for-upload',
	UPLOAD_PROCESSING: 'importer-upload-processing',
	UPLOAD_SUCCESS: 'importer-upload-success',
	UPLOAD_FAILURE: 'importer-upload-failure',
	UPLOADING: 'importer-uploading',
	IMPORT_CLEAR: 'importer-clear',
} );

export const WORDPRESS = 'importer-type-wordpress';
export const MEDIUM = 'importer-type-medium';
export const BLOGGER = 'importer-type-blogger';
export const SITE_IMPORTER = 'importer-type-site-importer';
export const SQUARESPACE = 'importer-type-squarespace';
