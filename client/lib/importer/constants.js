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

export const actionTypes = Object.freeze( {
	API_REQUEST: 'importer-api-request',
	API_FAILURE: 'importer-api-failure',
	API_SUCCESS: 'importer-api-success',

	LOCK_IMPORT: 'importer-lock-import',
	UNLOCK_IMPORT: 'importer-unlock-import',

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
