/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { reducer as themes } from './themes';
import { reducer as themesList } from './themes-list';
import { reducer as themesLastQuery } from './themes-last-query';
import { reducer as currentTheme } from './current-theme';

export default combineReducers( {
	themes,
	themesList,
	themesLastQuery,
	currentTheme
} );
