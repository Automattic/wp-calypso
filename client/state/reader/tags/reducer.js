import { combineReducers } from 'calypso/state/utils';
import images from './images/reducer';
import items from './items/reducer';

export default combineReducers( {
	images,
	items,
} );
