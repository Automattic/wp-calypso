/** @format */

/**
 * External dependencies
 */
import { registerStore } from '@wordpress/data';

/**
 * Internal dependencies
 */
import * as actions from './actions';
import * as resolvers from './resolvers';
import * as selectors from './selectors';
import controls from './controls';
import reducer from './reducer';

const store = registerStore( 'jetpack/publicize', {
	actions,
	controls,
	reducer,
	resolvers,
	selectors,
} );

export default store;
