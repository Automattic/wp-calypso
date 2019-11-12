/**
 * External dependencies
 */
import { controls } from '@wordpress/data-controls';
import { registerStore } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as actions from './actions';
import * as selectors from './selectors';
import * as resolvers from './resolvers';
import { TailParameters } from './types';

export { STORE_KEY };

registerStore< State >( STORE_KEY, {
	actions,
	controls,
	reducer,
	resolvers,
	selectors,
	// persist: [],
} );

type Select = {
	[ selector in keyof typeof selectors ]: (
		...args: TailParameters< typeof selectors[ selector ] >
	) => ReturnType< typeof selectors[ selector ] >;
};

type Dispatch = {
	[ A in keyof typeof actions ]: ( ...args: Parameters< typeof actions[ A ] > ) => void;
};

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): Dispatch;
	function select( key: typeof STORE_KEY ): Select;
}
