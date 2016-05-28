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
	UPLOAD_SUCCESS: 'importer-upload-success',
	UPLOAD_FAILURE: 'importer-upload-failure',
	UPLOADING: 'importer-uploading'
} );

export const WORDPRESS = 'importer-type-wordpress';
export const MEDIUM = 'importer-type-medium';
