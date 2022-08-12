import { combineReducers } from 'calypso/state/utils';
import designType from './design-type/reducer';
import siteTitle from './site-title/reducer';
import siteType from './site-type/reducer';
import websiteContentCollection from './website-content/reducer';

export default combineReducers( {
	designType,
	siteTitle,
	siteType,
	websiteContentCollection,
} );
