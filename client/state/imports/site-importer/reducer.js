/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers } from 'calypso/state/utils';
import {
	SITE_IMPORTER_IMPORT_FAILURE,
	SITE_IMPORTER_IMPORT_RESET,
	SITE_IMPORTER_IMPORT_START,
	SITE_IMPORTER_IMPORT_SUCCESS,
	SITE_IMPORTER_IS_SITE_IMPORTABLE_FAILURE,
	SITE_IMPORTER_IS_SITE_IMPORTABLE_START,
	SITE_IMPORTER_IS_SITE_IMPORTABLE_SUCCESS,
	SITE_IMPORTER_VALIDATION_ERROR_SET,
} from 'calypso/state/action-types';

const DEFAULT_ERROR_STATE = {
	error: false,
	errorMessage: '',
	errorType: null,
};
const DEFAULT_IMPORT_STAGE = 'idle';
const DEFAULT_IMPORT_DATA = {};

const isLoading = ( state = false, action ) => {
	switch ( action.type ) {
		case SITE_IMPORTER_IMPORT_FAILURE:
			return false;
		case SITE_IMPORTER_IMPORT_START:
			return true;
		case SITE_IMPORTER_IMPORT_SUCCESS:
			return false;
		case SITE_IMPORTER_IMPORT_RESET:
			return false;
		case SITE_IMPORTER_IS_SITE_IMPORTABLE_FAILURE:
			return false;
		case SITE_IMPORTER_IS_SITE_IMPORTABLE_START:
			return true;
		case SITE_IMPORTER_IS_SITE_IMPORTABLE_SUCCESS:
			return false;
	}

	return state;
};

const error = ( state = DEFAULT_ERROR_STATE, action ) => {
	switch ( action.type ) {
		case SITE_IMPORTER_IMPORT_SUCCESS:
			return DEFAULT_ERROR_STATE;
		case SITE_IMPORTER_IMPORT_FAILURE: {
			const { message } = action;

			return {
				error: true,
				errorType: 'importError',
				errorMessage: message,
			};
		}
		case SITE_IMPORTER_IMPORT_START:
			return DEFAULT_ERROR_STATE;
		case SITE_IMPORTER_IS_SITE_IMPORTABLE_SUCCESS:
			return DEFAULT_ERROR_STATE;
		case SITE_IMPORTER_IS_SITE_IMPORTABLE_FAILURE: {
			const { message } = action;

			return {
				error: true,
				errorType: 'importError',
				errorMessage: message,
			};
		}
		case SITE_IMPORTER_IS_SITE_IMPORTABLE_START:
			return DEFAULT_ERROR_STATE;
		case SITE_IMPORTER_IMPORT_RESET:
			return DEFAULT_ERROR_STATE;
		case SITE_IMPORTER_VALIDATION_ERROR_SET: {
			const { message } = action;

			return {
				error: true,
				errorType: 'validationError',
				errorMessage: message,
			};
		}
	}

	return state;
};

const importStage = ( state = DEFAULT_IMPORT_STAGE, action ) => {
	switch ( action.type ) {
		case SITE_IMPORTER_IS_SITE_IMPORTABLE_SUCCESS:
			return 'importable';
		case SITE_IMPORTER_IMPORT_RESET:
			return DEFAULT_IMPORT_STAGE;
	}

	return state;
};

const importData = ( state = DEFAULT_IMPORT_DATA, action ) => {
	switch ( action.type ) {
		case SITE_IMPORTER_IS_SITE_IMPORTABLE_SUCCESS: {
			const { response } = action;

			return {
				title: response.site_title,
				supported: response.supported_content,
				unsupported: response.unsupported_content,
				favicon: response.favicon,
				engine: response.engine,
				url: response.url,
			};
		}
	}

	return state;
};

const validatedSiteUrl = ( state = '', action ) => {
	switch ( action.type ) {
		case SITE_IMPORTER_IS_SITE_IMPORTABLE_SUCCESS: {
			const { response } = action;
			return get( response, 'site_url', '' );
		}
	}

	return state;
};

export default combineReducers( {
	isLoading,
	error,
	importStage,
	importData,
	validatedSiteUrl,
} );
