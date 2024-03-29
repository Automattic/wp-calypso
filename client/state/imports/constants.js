export const appStates = Object.freeze( {
	CANCEL_PENDING: 'importer-canceling',
	DEFUNCT: 'importer-defunct',
	DISABLED: 'importer-disabled',
	EXPIRED: 'importer-expired',
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

export const MAX_FILE_SIZE = 104857000; // In bytes. The file limit is 100mb, but we leave 600 bytes for headers and other meta that are sent.
