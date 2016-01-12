export const appStates = Object.freeze( {
	DEFUNCT: 'importer-defunct',
	DISABLED: 'importer-disabled',
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

export const importerTypes = Object.freeze( {
	WORDPRESS: 'importer-type-wordpress',
	GHOST: 'importer-type-ghost',
	MEDIUM: 'importer-type-medium',
	SQUARESPACE: 'importer-type-squarespace'
} );

export const actionTypes = Object.freeze( {
	API_REQUEST: 'importer-api-request',
	API_FAILURE: 'importer-api-failure',
	API_SUCCESS: 'importer-api-success',

	RECEIVE_IMPORT_STATUS: 'importer-receive-import-status',

	CANCEL_IMPORT: 'importer-cancel',
	FAIL_UPLOAD: 'importer-fail-upload',
	FINISH_UPLOAD: 'importer-finish-upload',
	RESET_IMPORT: 'importer-reset',
	SET_UPLOAD_PROGRESS: 'importer-set-upload-progress',
	START_IMPORT: 'importer-start-import',
	START_UPLOAD: 'importer-start-upload',

	MAP_AUTHORS: 'importer-map-authors',
	START_MAPPING_AUTHORS: 'importer-start-mapping-authors',

	START_IMPORTING: 'importer-start-importing',

	DEV_SET_STATE: 'dev-set-state',
	RESET_STORE: 'dev-reset-store'
} );
