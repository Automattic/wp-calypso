/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import pick from 'lodash/pick';

/**
 * Internal dependencies
 */
import { plans } from './plans/reducer';
import mediaStorage from './media-storage/reducer';
import { SITE_RECEIVE, DESERIALIZE } from 'state/action-types';
import { sitesSchema } from './schema';
import { isValidStateWithSchema } from 'state/utils';

/**
 * Constants
 */
// [TODO]: This validation is only necessary so long as we continue to receive
// decorated sites from the `lib/sites-list` module.
const VALID_SITE_KEYS = Object.keys( sitesSchema.patternProperties[ '^\\d+$' ].properties );

/**
 * Tracks all known site objects, indexed by site ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case SITE_RECEIVE:
			const site = pick( action.site, VALID_SITE_KEYS );
			return Object.assign( {}, state, {
				[ site.ID ]: site
			} );

		case DESERIALIZE:
			if ( isValidStateWithSchema( state, sitesSchema ) ) {
				return state;
			}

			return {};
	}

	return state;
}

export default combineReducers( {
	items,
	mediaStorage,
	plans
} );
