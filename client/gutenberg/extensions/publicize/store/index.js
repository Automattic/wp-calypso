/**
 * External dependencies
 */
import { registerStore } from '@wordpress/data';

/**
 * Internal dependencies
 */
import * as actions from './actions';
import * as selectors from './selectors';
import applyMiddlewares from './middlewares';
import controls from './controls';
import reducer from './reducer';

const store = registerStore( 'jetpack/publicize', {
	actions,
	controls,
	reducer,
	selectors,
} );

applyMiddlewares( store );

export default store;
