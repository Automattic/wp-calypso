/**
 * Internal dependencies
 */
import { combineReducers, withStorageKey } from 'calypso/state/utils';
import chat from './chat/reducer';
import connection from './connection/reducer';
import ui from './ui/reducer';
import user from './user/reducer';

const combinedReducer = combineReducers( {
	chat,
	connection,
	ui,
	user,
} );

export default withStorageKey( 'happychat', combinedReducer );
