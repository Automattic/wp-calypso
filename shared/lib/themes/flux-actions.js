/**
 * External dependencies
 */
import { applyMiddleware } from 'redux';
import { bindActionCreators } from 'redux';
import thunkMiddleware from 'redux-thunk';
import debugModule from 'debug';
const debug = debugModule( 'calypso:themes:flux-actions' ); //eslint-disable-line no-unused-vars

/**
 * Internal dependencies
 */
import ThemesStore from './stores/themes';
import ThemesListStore from './stores/themes-list';
import CurrentThemeStore from './stores/current-theme';
import ThemesLastQueryStore from './stores/themes-last-query';
import * as actions from './actions';
import { combineStores } from 'lib/store';
import { analyticsMiddleware } from './middlewares.js';

const combineStoresWithMiddleware = applyMiddleware(
	thunkMiddleware,
	analyticsMiddleware
)( combineStores );

const combinedStore = combineStoresWithMiddleware( {
	themes: ThemesStore,
	themesList: ThemesListStore,
	themesLastQuery: ThemesLastQueryStore,
	currentTheme: CurrentThemeStore
}, 'themes' );

/**
 * As we're wrapping `./actions` in bulk here, we cannot individually specify
 * the `source` argument to `combinedStore.dispatch()` (`VIEW_ACTION` or `SERVER_ACTION`) --
 * cf. `shared/dispatcher`. This doesn't seem to be much of a concern, as we aren't currently
 * using that information anyway. To retain it, we'd need to call `bindActionCreators()`
 * individually for each action, and bind `combinedStore.dispatch` to the desired `source`
 * constant.
 */
export default bindActionCreators( actions, combinedStore.dispatch );
