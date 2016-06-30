/**
 * External dependencies
 */
import debugFactory from 'debug';
import moment from 'moment';
import omit from 'lodash/omit';

/**
 * Internal dependencies
 */
import { isValidStateWithSchema } from 'state/utils';

import {
	firstViewSchema
} from './schema';

import { FIRST_VIEW_START_DATES } from './constants';

import {
	DESERIALIZE,
	SERIALIZE,
	FIRST_VIEW_DISABLE,
	FIRST_VIEW_ENABLE,
	FIRST_VIEW_HIDE,
	FIRST_VIEW_SHOW,
} from 'state/action-types';

const debug = debugFactory( 'calypso:first-view' );

export function firstView( state = { disabled: [], visible: [] }, action ) {
	switch ( action.type ) {

		case DESERIALIZE: {
			// only 'disabled' state is persisted
			const newState = omit( state, 'visible' );
			if ( isValidStateWithSchema( newState, firstViewSchema ) ) {
				return Object.assign( {}, newState, { visible: [] } );
			}
			debug( 'INVALID firstView state during DESERIALIZE', newState );
			return {
				disabled: [],
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
				disabled: [],
				visible: [],
			};
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
			return Object.assign( {}, state, { visible: state.visible.filter( view => {
				return view !== action.view;
			} ) } );

		case FIRST_VIEW_SHOW:
			const isViewDisabled = ( -1 !== state.disabled.indexOf( action.view ) );
			let isUserEligible = true;

			// Check user-creation date if a user is provided
			if ( action.user ) {
				const userCreated = moment( action.user.get().date );
				if ( moment( FIRST_VIEW_START_DATES[ action.view ] ).isAfter( userCreated ) ) {
					isUserEligible = false;
				}
			}

			if ( action.force || ( ! isViewDisabled && isUserEligible ) ) {
				return Object.assign( {}, state, { visible: state.visible.concat( action.view ) } );
			}
			return state;
	}
	return state;
}

export default firstView;
