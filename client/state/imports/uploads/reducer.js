/**
 * Internal dependencies
 */
import { combineReducers, withoutPersistence } from 'calypso/state/utils';
import {
	IMPORTS_UPLOAD_SET_PROGRESS,
	IMPORTS_UPLOAD_COMPLETED,
	IMPORTS_UPLOAD_FAILED,
	IMPORTS_UPLOAD_START,
} from 'calypso/state/action-types';

const inProgress = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case IMPORTS_UPLOAD_COMPLETED:
			return false;
		case IMPORTS_UPLOAD_FAILED:
			return false;
		case IMPORTS_UPLOAD_START:
			return true;
	}

	return state;
} );

const percentComplete = withoutPersistence( ( state = 0, action ) => {
	switch ( action.type ) {
		case IMPORTS_UPLOAD_SET_PROGRESS:
			return ( action.uploadLoaded / ( action.uploadTotal + Number.EPSILON ) ) * 100;
		case IMPORTS_UPLOAD_COMPLETED:
			return 0;
		case IMPORTS_UPLOAD_FAILED:
			return 0;
		case IMPORTS_UPLOAD_START:
			return 0;
	}

	return state;
} );

const filename = withoutPersistence( ( state = '', action ) => {
	switch ( action.type ) {
		case IMPORTS_UPLOAD_COMPLETED:
			return '';
		case IMPORTS_UPLOAD_FAILED:
			return '';
		case IMPORTS_UPLOAD_START:
			return action.filename;
	}

	return state;
} );

export default combineReducers( {
	inProgress,
	percentComplete,
	filename,
} );
