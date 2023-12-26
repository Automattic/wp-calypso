import { STATS_PAID_STATS_UPSELL_MODAL_TOGGLE } from 'calypso/state/action-types';
import {
	combineReducers,
	keyedReducer,
	withSchemaValidation,
	withPersistence,
} from 'calypso/state/utils';
import { schema } from './schema';
import type { Reducer, AnyAction } from 'redux';

/**
 * Returns the updated value for the paid stats upsell modal.
 * @param {Object} state - Current state.
 * @param {Object} action - Action object.
 * @returns {Object} Updated state.
 */
const modalReducer = ( state = { view: false, statType: null }, action: AnyAction ) => {
	switch ( action.type ) {
		case STATS_PAID_STATS_UPSELL_MODAL_TOGGLE: {
			return { view: ! state.view, statType: action.payload.statType };
		}
	}
	return state;
};

export const data = withSchemaValidation(
	schema,
	keyedReducer( 'siteId', withPersistence( modalReducer as Reducer ) )
);

export default combineReducers( { data } );
