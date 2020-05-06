/**
 * External dependencies
 */
import { controls } from '@wordpress/data-controls';
import { registerStore } from '@wordpress/data';

import { STORE_KEY } from './constants';
import reducer from './reducer';
import * as actions from './actions';
import * as selectors from './selectors';
import { SelectFromMap, DispatchFromMap } from '@automattic/data-stores';

export type State = import('./reducer').State;
export { STORE_KEY };

registerStore< State >( STORE_KEY, {
	actions,
	controls,
	reducer: reducer as any,
	selectors,
	// @TODO: work on persistence
	// persist: [ 'selectedPlan' ],
} );

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< typeof actions >;
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
