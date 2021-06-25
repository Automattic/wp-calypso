/**
 * External dependencies
 */
import type { Reducer } from 'redux';

export default function getInitialState< TState >( reducer: Reducer< TState > ): TState {
	return reducer( undefined, { type: '@@calypso/INIT' } );
}
