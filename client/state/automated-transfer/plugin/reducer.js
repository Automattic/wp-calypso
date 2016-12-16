/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { get, has } from 'lodash';

/**
 * Internal dependencies
 */
import uploadData from '../upload-data/reducer';
import {
	AUTOMATED_TRANSFER_UPLOAD as UPLOAD,
	AUTOMATED_TRANSFER_UPLOAD_UPDATE as UPDATE,
} from 'state/action-types';

export const slug = ( state = '', action ) => get( {
	[ UPLOAD ]: action.pluginSlug || state,
	[ UPDATE ]: action.pluginSlug || state,
}, action.type, state );

export default combineReducers( {
	slug,
	uploadData: uploadData( ( state, action ) => has( action, 'pluginSlug' ) ),
} );
