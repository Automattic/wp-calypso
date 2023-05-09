import { combineReducers } from 'calypso/state/utils';
import items from './items/reducer';

export default combineReducers( {
	items,
} );
