/**
 * External dependencies
 */
import debugFactory from 'debug';
import omit from 'lodash/omit';
import union from 'lodash/union';

/**
 * Internal dependencies
 */
import { isValidStateWithSchema } from 'state/utils';

import {
	firstViewSchema
} from './schema';

import {
	DESERIALIZE,
	SERIALIZE,
	FIRST_VIEW_DISABLE,
	FIRST_VIEW_ENABLE,
	FIRST_VIEW_HIDE,
	FIRST_VIEW_SHOW,
	ROUTE_SET,
} from 'state/action-types';

const debug = debugFactory( 'calypso:first-view' );
const initialState = { disabled: [], hidden: [] };

export function firstView( state = initialState, action ) {
	switch ( action.type ) {

		case DESERIALIZE: {
			// only 'disabled' state is persisted
			const newState = omit( state, 'hidden' );
			if ( isValidStateWithSchema( newState, firstViewSchema ) ) {
				return Object.assign( {}, newState, { hidden: [] } );
			}
			debug( 'INVALID firstView state during DESERIALIZE', newState );
			return initialState;
		}

		case SERIALIZE: {
			const newState = omit( state, 'hidden' );
			if ( isValidStateWithSchema( newState, firstViewSchema ) ) {
				return Object.assign( {}, newState, { disabled: [] } );
			}
			debug( 'INVALID firstView state during SERIALIZE', newState );
			return initialState;
		}

		case FIRST_VIEW_ENABLE:
			return Object.assign( {}, state, { disabled: state.disabled.filter( view => {
				return view !== action.view;
			} ) } );

		case FIRST_VIEW_DISABLE:
			if ( -1 === state.disabled.indexOf( action.view ) ) {
				return Object.assign( {}, state, { disabled: state.disabled.concat( action.view ) } );
			}
			return state;

		case FIRST_VIEW_HIDE:
			const hidden = union( state.hidden, [ action.view ] );

			const disabled = action.enabled
				? state.disabled.filter( view => view !== action.view )
				: union( state.disabled, [ action.view ] );

			return Object.assign( {}, state, {
				hidden,
				disabled,
			} );

		// I don't think we actually need this
		case FIRST_VIEW_SHOW:
			return Object.assign( {}, state, {
				hidden: state.hidden.filter( view => view !== action.view ),
			} );

		// This is necessary to show the first view again when we go back to a section in a single session
		case ROUTE_SET:
			return Object.assign( {}, state, {
				hidden: []
			} );
	}
	return state;
}

export default firstView;
