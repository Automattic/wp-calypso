/**
 * External dependencies
 */
import union from 'lodash/union';

/**
 * Internal dependencies
 */

import {
	FIRST_VIEW_HIDE,
	ROUTE_SET,
} from 'state/action-types';

const initialState = { hidden: [] };

export function firstView( state = initialState, action ) {
	switch ( action.type ) {

		case FIRST_VIEW_HIDE:
			const hidden = union( state.hidden, [ action.view ] );

			return Object.assign( {}, state, {
				hidden,
			} );

		case ROUTE_SET:
			return Object.assign( {}, state, {
				hidden: []
			} );

	}
	return state;
}

export default firstView;
