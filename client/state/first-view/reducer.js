/**
 * External dependencies
 */
import debugFactory from 'debug';
import omit from 'lodash/omit';

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
	FIRST_VIEW_DISABLED_SET,
	FIRST_VIEW_ENABLE,
	FIRST_VIEW_HIDE,
	FIRST_VIEW_SHOW,
	FIRST_VIEW_VISIBLE_SET,
} from 'state/action-types';

const debug = debugFactory( 'calypso:first-view' );
const initialState = { disabled: [], visible: [] };

export function firstView( state = initialState, action ) {
	switch ( action.type ) {

		case DESERIALIZE: {
			const newState = omit( state, 'visible' );
			if ( isValidStateWithSchema( newState, firstViewSchema ) ) {
				return Object.assign( {}, newState, { visible: [] } );
			}
			debug( 'INVALID firstView state during DESERIALIZE', newState );
			return initialState;
		}

		case SERIALIZE: {
			const newState = omit( state, 'visible' );
			if ( isValidStateWithSchema( newState, firstViewSchema ) ) {
				return Object.assign( {}, newState, { visible: [] } );
			}
			debug( 'INVALID firstView state during SERIALIZE', newState );
			return initialState;
		}

		case FIRST_VIEW_DISABLED_SET:
			return Object.assign( {}, state, { disabled: action.views } );

		case FIRST_VIEW_VISIBLE_SET:
			return Object.assign( {}, state, { visible: action.views } );

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
			return Object.assign( {}, state, { visible: state.visible.filter( view => {
				return view !== action.view;
			} ) } );

		case FIRST_VIEW_SHOW:
			if ( -1 === state.visible.indexOf( action.view ) ) {
				return Object.assign( {}, state, { visible: state.visible.concat( action.view ) } );
			}
			return state;
	}
	return state;
}

export default firstView;
