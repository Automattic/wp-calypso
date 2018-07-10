/**
 * WordPress Dependencies
 */
import {
	registerStore,
	withRehydration,
	loadAndPersist,
} from '@wordpress/data';

/**
 * Internal dependencies
 */
import reducer from './reducer';
import applyMiddlewares from './middlewares';
import * as actions from './actions';
import * as selectors from './selectors';

/**
 * Module Constants
 */
const STORAGE_KEY = `WP_EDIT_POST_PREFERENCES_${ window.userSettings.uid }`;

const store = registerStore( 'core/edit-post', {
	reducer: withRehydration( reducer, 'preferences', STORAGE_KEY ),
	actions,
	selectors,
} );

applyMiddlewares( store );
loadAndPersist( store, reducer, 'preferences', STORAGE_KEY );
store.dispatch( { type: 'INIT' } );

export default store;
