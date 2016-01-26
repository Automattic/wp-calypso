/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import themes from './themes/reducer';
import themesList from './themes-list/reducer';
import themesLastQuery from './themes-last-query/reducer';
import currentTheme from './current-theme/reducer';

export default combineReducers( {
	themes,
	themesList,
	themesLastQuery,
	currentTheme
} );
