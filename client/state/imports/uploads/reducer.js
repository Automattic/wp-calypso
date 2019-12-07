/** @format */
/**
 * Internal dependencies
 */
import { createReducer, combineReducers } from 'state/utils';
import {
	IMPORTS_UPLOAD_SET_PROGRESS,
	IMPORTS_UPLOAD_COMPLETED,
	IMPORTS_UPLOAD_FAILED,
	IMPORTS_UPLOAD_START,
} from 'state/action-types';

const inProgress = createReducer( false, {
	[ IMPORTS_UPLOAD_COMPLETED ]: () => false,
	[ IMPORTS_UPLOAD_FAILED ]: () => false,
	[ IMPORTS_UPLOAD_START ]: () => true,
} );

const percentComplete = createReducer( 0, {
	[ IMPORTS_UPLOAD_SET_PROGRESS ]: ( state, action ) =>
		( action.uploadLoaded / ( action.uploadTotal + Number.EPSILON ) ) * 100,
	[ IMPORTS_UPLOAD_COMPLETED ]: () => 0,
	[ IMPORTS_UPLOAD_FAILED ]: () => 0,
	[ IMPORTS_UPLOAD_START ]: () => 0,
} );

const filename = createReducer( '', {
	[ IMPORTS_UPLOAD_COMPLETED ]: () => '',
	[ IMPORTS_UPLOAD_FAILED ]: () => '',
	[ IMPORTS_UPLOAD_START ]: ( state, action ) => action.filename,
} );

export default combineReducers( {
	inProgress,
	percentComplete,
	filename,
} );
