/**
 * External dependencies
 */
import { registerStore } from '@wordpress/data';

/**
 * Internal dependencies
 */
import reducer, { State } from './reducer';
import * as actions from './actions';
import * as selectors from './selectors';

export const STORE_KEY = 'automattic/onboard';

const store = registerStore< State >( STORE_KEY, {
	reducer,
	actions,
	selectors,
	// persist: [],
} );

export default store;
