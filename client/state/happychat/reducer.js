/** @format **/

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import connection from './connection/reducer';
import chat from './chat/reducer';
import ui from './ui/reducer';
import user from './user/reducer';

export default combineReducers( {
	connection,
	chat,
	ui,
	user,
} );
