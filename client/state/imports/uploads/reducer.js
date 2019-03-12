/** @format */
/**
 * Internal dependencies
 */
import { createReducer, combineReducers } from 'state/utils';
import {
	IMPORTS_UPLOAD_SET_PROGRESS,
	IMPORTS_UPLOAD_COMPLETED,
	IMPORTS_UPLOAD_EVALUATE_FILE,
	IMPORTS_UPLOAD_FAILED,
	IMPORTS_UPLOAD_FILE_CLEAR,
	IMPORTS_UPLOAD_RECOMMEND_UX,
	IMPORTS_UPLOAD_START,
} from 'state/action-types';

const inProgress = createReducer( false, {
	[ IMPORTS_UPLOAD_COMPLETED ]: () => false,
	[ IMPORTS_UPLOAD_EVALUATE_FILE ]: () => false,
	[ IMPORTS_UPLOAD_FAILED ]: () => false,
	[ IMPORTS_UPLOAD_START ]: () => true,
} );

const percentComplete = createReducer( 0, {
	[ IMPORTS_UPLOAD_SET_PROGRESS ]: ( state, action ) =>
		( action.uploadLoaded / ( action.uploadTotal + Number.EPSILON ) ) * 100,
	[ IMPORTS_UPLOAD_COMPLETED ]: () => 0,
	[ IMPORTS_UPLOAD_EVALUATE_FILE ]: () => 0,
	[ IMPORTS_UPLOAD_FAILED ]: () => 0,
	[ IMPORTS_UPLOAD_START ]: () => 0,
} );

const file = createReducer( null, {
	[ IMPORTS_UPLOAD_COMPLETED ]: () => null,
	[ IMPORTS_UPLOAD_EVALUATE_FILE ]: ( state, action ) => action.file,
	[ IMPORTS_UPLOAD_FILE_CLEAR ]: () => null,
	[ IMPORTS_UPLOAD_FAILED ]: () => null,
} );

const recommendedUX = createReducer( null, {
	[ IMPORTS_UPLOAD_EVALUATE_FILE ]: () => null,
	[ IMPORTS_UPLOAD_FILE_CLEAR ]: () => null,
	[ IMPORTS_UPLOAD_RECOMMEND_UX ]: ( state, action ) => action.ux,
} );

export default combineReducers( {
	inProgress,
	percentComplete,
	recommendedUX,
	file,
} );
