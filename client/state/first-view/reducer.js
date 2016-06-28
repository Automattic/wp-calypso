/**
 * External dependencies
 */
import omit from 'lodash/omit';
import debugFactory from 'debug';

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
	FIRST_VIEW_DISMISS,
	FIRST_VIEW_EMBRACE,
	FIRST_VIEW_HIDE,
	FIRST_VIEW_SHOW,
} from 'state/action-types';

const debug = debugFactory( 'calypso:first-view' );

export function firstView( state = { dismissed: [], visible: [] }, action ) {
	switch ( action.type ) {

		case DESERIALIZE: {
			// only 'dismissed' state is persisted, as we want first-view to reappear on init if it wasn't dismissed
			const newState = omit( state, 'visible' );
			if ( isValidStateWithSchema( newState, firstViewSchema ) ) {
				return Object.assign( {}, newState, { visible: [] } );
			}
			debug( 'INVALID firstView state during DESERIALIZE', newState );
			return {
				dismissed: [],
				visible: [],
			};
		}

		case SERIALIZE: {
			const newState = omit( state, 'visible' );
			if ( isValidStateWithSchema( newState, firstViewSchema ) ) {
				return Object.assign( {}, newState, { visible: [] } );
			}
			debug( 'INVALID firstView state during SERIALIZE', newState );
			return {
				dismissed: [],
				visible: [],
			};
		}

		case FIRST_VIEW_EMBRACE:
			return Object.assign( {}, state, { dismissed: state.dismissed.filter( view => {
				return view !== action.view;
			} ) } );

		case FIRST_VIEW_DISMISS:
			if ( -1 === state.dismissed.indexOf( action.view ) ) {
				return Object.assign( {}, state, { dismissed: state.dismissed.concat( action.view ) } );
			}
			return state;

		case FIRST_VIEW_HIDE:
			return Object.assign( {}, state, { visible: state.visible.filter( view => {
				return -1 === action.views.indexOf( view );
			} ) } );

		case FIRST_VIEW_SHOW:
			const filteredViews = action.views.filter( view => {
				const isDismissed = ( -1 !== state.dismissed.indexOf( view ) ),
					isVisible = ( -1 !== state.visible.indexOf( view ) );

				if ( isVisible ) {
					// We don't want duplicates. The view is already visible.
					return false;
				}

				// If action.force is set, we show regardless of dismissed state.
				return action.force || ! isDismissed;
			} );

			return Object.assign( {}, state, { visible: state.visible.concat( filteredViews ) } );

	}
	return state;
}

export default firstView;
