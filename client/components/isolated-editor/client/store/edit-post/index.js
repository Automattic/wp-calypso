/**
 * WordPress dependencies
 */
import { registerStore, combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */

const STORE_KEY = 'core/edit-post';

// This is a fake store to prevent errors if anything tries to use `isFeatureActive`
const store = registerStore( STORE_KEY, {
	reducer: combineReducers( {} ),
	actions: {},
	selectors: {
		isFeatureActive: () => false,
	},
} );

export default store;
