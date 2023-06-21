import { withStorageKey } from '@automattic/state-utils';
import { INLINE_HELP_POPOVER_HIDE, INLINE_HELP_POPOVER_SHOW } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

export const popover = ( state = { isVisible: false }, action ) => {
	switch ( action.type ) {
		case INLINE_HELP_POPOVER_SHOW:
			return { ...state, isVisible: true };
		case INLINE_HELP_POPOVER_HIDE:
			return { ...state, isVisible: false };
	}

	return state;
};

const combinedReducer = combineReducers( {
	popover,
} );

export default withStorageKey( 'inlineHelp', combinedReducer );
