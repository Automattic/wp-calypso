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
 * Returns the updated modules settings state after an action has been dispatched.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
const dataReducer = (
	state = { view: false, siteSlug: null, statType: null },
	action: AnyAction
) => {
	switch ( action.type ) {
		case STATS_PAID_STATS_UPSELL_MODAL_TOGGLE: {
			return { view: ! state.view, ...action.payload };
		}
	}
	return state;
};

export const data = withSchemaValidation(
	schema,
	keyedReducer( 'siteSlug', withPersistence( dataReducer as Reducer ) )
);

export default combineReducers( { data } );
