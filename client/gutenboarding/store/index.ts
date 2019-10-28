/**
 * External dependencies
 */
import { controls } from '@wordpress/data-controls';
import { registerStore, useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as actions from './actions';
import * as selectors from './selectors';
import * as resolvers from './resolvers';

registerStore< State >( STORE_KEY, {
	actions,
	controls,
	reducer,
	resolvers,
	selectors,
	// persist: [],
} );

export function useOnboardingState(): State {
	return useSelect( select => select( STORE_KEY ).getState() );
}

export function useOnboardingDispatch() {
	return useDispatch( STORE_KEY ) as {
		[ D in keyof typeof actions ]: ( ...args: Parameters< typeof actions[ D ] > ) => void;
	};
}
