/** @format */
/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import { IMPORTER_NUX_URL_INPUT_SET } from 'state/action-types';

export const urlInputValue = ( state = '', action ) =>
	action.type === IMPORTER_NUX_URL_INPUT_SET ? action.value : state;

export default combineReducers( { urlInputValue } );
