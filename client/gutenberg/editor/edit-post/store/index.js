/**
 * WordPress Dependencies
 */
import {
	registerStore,
	restrictPersistence,
} from '@wordpress/data';

/**
 * Internal dependencies
 */
import reducer from './reducer';
import applyMiddlewares from './middlewares';
import * as actions from './actions';
import * as selectors from './selectors';
const store = registerStore( 'core/edit-post', {
	reducer: restrictPersistence( reducer, 'preferences' ),
	actions,
	selectors,
	persist: true,
} );

applyMiddlewares( store );
store.dispatch( { type: 'INIT' } );

export default store;
