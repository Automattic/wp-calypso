/**
 * External dependencies
 */
import { registerStore, useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import reducer, { State } from './reducer';
import * as actions from './actions';
import * as selectors from './selectors';

export const STORE_KEY = 'automattic/onboard';

registerStore< State >( STORE_KEY, {
	reducer,
	actions,
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
