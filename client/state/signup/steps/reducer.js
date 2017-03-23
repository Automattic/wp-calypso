/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import siteTitle from './site-title/reducer';
import survey from './survey/reducer';

export default combineReducers({
    siteTitle,
    survey,
});
