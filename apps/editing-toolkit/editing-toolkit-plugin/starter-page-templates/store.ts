/**
 * External dependencies
 */
import { registerStore } from '@wordpress/data';
import type { Reducer } from 'redux';

type OpenState = 'CLOSED' | 'OPEN_FROM_ADD_PAGE';
type Action = ReturnType< typeof actions.setOpenState >;

const reducer: Reducer< OpenState, Action > = ( state = 'CLOSED', { type, ...action } ) =>
	'SET_IS_OPEN' === type ? action.openState : state;

const actions = {
	setOpenState: ( openState: OpenState | false ) => ( {
		type: 'SET_IS_OPEN' as const,
		openState: openState || 'CLOSED',
	} ),
};

const selectors = {
	isOpen: ( state: OpenState ): boolean => 'CLOSED' !== state,
};

const STORE_KEY = 'automattic/starter-page-layouts';

registerStore( STORE_KEY, {
	// In reality the store can dispatch any action, however `reducer` has a
	// strongly typed action type to make the typings inside the function
	// easier to work with.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	reducer: reducer as any,
	actions,
	selectors,
} );

declare module '@wordpress/data' {
	function dispatch( key: 'automattic/starter-page-layouts' ): typeof actions;
	function select(
		key: 'automattic/starter-page-layouts'
	): {
		isOpen: () => ReturnType< typeof selectors.isOpen >;
	};
}
