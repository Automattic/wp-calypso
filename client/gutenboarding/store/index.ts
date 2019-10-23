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

const store = registerStore< State >( 'automattic/onboard', {
	reducer,
	actions,
	selectors,
	// persist: [],
} );

export default store;
