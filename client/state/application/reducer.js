/**
 * Internal dependencies
 */
import {
	CONNECTION_LOST,
	CONNECTION_RESTORED
} from 'state/action-types';
import { combineReducersWithPersistence, createReducer } from 'state/utils';

export const connectionState = createReducer( 'CHECKING', {
	[ CONNECTION_LOST ]: () => 'OFFLINE',
	[ CONNECTION_RESTORED ]: () => 'ONLINE'
} );

export default combineReducersWithPersistence( {
	connectionState
} );
