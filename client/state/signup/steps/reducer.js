/**
 * Internal dependencies
 */
import designType from './design-type/reducer';
import siteTitle from './site-title/reducer';
import survey from './survey/reducer';
import { combineReducers } from 'state/utils';

export default combineReducers( {
	designType,
	siteTitle,
	survey,
} );
