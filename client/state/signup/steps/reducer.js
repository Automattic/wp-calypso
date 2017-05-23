/**
 * Internal dependencies
 */
import siteTitle from './site-title/reducer';
import { combineReducersWithPersistence } from 'state/utils';
import survey from './survey/reducer';

export default combineReducersWithPersistence( {
	siteTitle,
	survey,
} );
