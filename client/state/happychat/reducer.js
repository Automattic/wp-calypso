/** @format */

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import chat from './chat/reducer';
import connection from './connection/reducer';
import ui from './ui/reducer';
import user from './user/reducer';

export default combineReducers( {
	chat,
	connection,
	ui,
	user,
} );
