/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import themes from './themes';
import themesList from './themes-list';
import themesLastQuery from './themes-last-query';
import currentTheme from './current-theme';

export default combineReducers( {
	themes,
	themesList,
	themesLastQuery,
	currentTheme
} );
