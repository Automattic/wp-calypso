import { register, createReduxStore } from '@wordpress/data';
import type { Reducer } from 'redux';

type OpenState = 'CLOSED' | 'OPEN_FROM_ADD_PAGE' | 'OPEN_FOR_BLANK_CANVAS';
type Action = ReturnType< typeof actions.setOpenState >;

const reducer: Reducer< OpenState, Action > = ( state = 'CLOSED', { type, ...action } ) =>
	'SET_IS_OPEN' === type ? action.openState : state;

const actions = {
	setOpenState: ( openState: OpenState | false ) => ( {
		type: 'SET_IS_OPEN' as const,
		openState: openState || 'CLOSED',
	} ),
};

export const selectors = {
	isOpen: ( state: OpenState ): boolean => 'CLOSED' !== state,
	isPatternPicker: ( state: OpenState ): boolean => 'OPEN_FOR_BLANK_CANVAS' === state,
};

export const pageLayoutStore = createReduxStore( 'automattic/starter-page-layouts', {
	reducer,
	actions,
	selectors,
} );
register( pageLayoutStore );
