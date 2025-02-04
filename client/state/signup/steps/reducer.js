import { combineReducers } from 'calypso/state/utils';
import designType from './design-type/reducer';
import websiteContentCollection from './website-content/reducer';

export default combineReducers( {
	designType,
	websiteContentCollection,
} );
