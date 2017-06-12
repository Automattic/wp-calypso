/**
 * Internal dependencies
 */
import siteTitle from './site-title/reducer';
import { combineReducers } from 'state/utils';
import survey from './survey/reducer';

export default combineReducers( {
	siteTitle,
	survey,
} );
