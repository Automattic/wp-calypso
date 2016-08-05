/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import pick from 'lodash/pick';
import merge from 'lodash/merge';

/**
 * Internal dependencies
 */
import { plans } from './plans/reducer';
import domains from './domains/reducer';
import guidedTransfer from './guided-transfer/reducer';
import vouchers from './vouchers/reducer';

import mediaStorage from './media-storage/reducer';
import {
	SITE_RECEIVE,
	SITE_REQUEST,
	SITE_REQUEST_FAILURE,
	SITE_REQUEST_SUCCESS,
	SITES_RECEIVE,
	SITES_REQUEST,
	SITES_REQUEST_FAILURE,
	SITES_REQUEST_SUCCESS,
	DESERIALIZE,
	THEME_ACTIVATED,
	WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
} from 'state/action-types';
import { sitesSchema } from './schema';
import { isValidStateWithSchema, createReducer } from 'state/utils';

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
		case WORDADS_SITE_APPROVE_REQUEST_SUCCESS:
			const prevSite = state[ action.siteId ];
			if ( prevSite ) {
				return Object.assign( {}, state, {
					[ action.siteId ]: merge( {}, prevSite, { options: { wordads: true } } )
				} );
			}
			return state;
		case SITE_RECEIVE: {
			const site = pick( action.site, VALID_SITE_KEYS );
			return Object.assign( {}, state, {
				[ site.ID ]: site
			} );
		}

		case SITES_RECEIVE:
			return action.sites.reduce( ( memo, site ) => {
				memo[ site.ID ] = pick( site, VALID_SITE_KEYS );
				return memo;
			}, {} );

		case THEME_ACTIVATED:
			const { siteId, theme } = action;
			const site = state[ siteId ];
			if ( ! site ) {
				break;
			}

			return {
				...state,
				[ siteId ]: merge( {}, site, {
					options: {
						theme_slug: theme.stylesheet
					}
				} )
			};

		case DESERIALIZE:
			if ( isValidStateWithSchema( state, sitesSchema ) ) {
				return state;
			}
			return {};
	}

	return state;
}

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks whether a network request is in progress for all
 * sites.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @return {Object}        Updated state
 */
export const requestingAll = createReducer( false, {
	[ SITES_REQUEST ]: () => true,
	[ SITES_REQUEST_FAILURE ]: () => false,
	[ SITES_REQUEST_SUCCESS ]: () => false
} );

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks whether a network request is in progress for a site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @return {Object}        Updated state
 */
export const requesting = createReducer( {}, {
	[ SITE_REQUEST ]: ( state, { siteId } ) => {
		return { ...state, [ siteId ]: true };
	},
	[ SITE_REQUEST_FAILURE ]: ( state, { siteId } ) => {
		return { ...state, [ siteId ]: false };
	},
	[ SITE_REQUEST_SUCCESS ]: ( state, { siteId } ) => {
		return { ...state, [ siteId ]: false };
	}
} );

export default combineReducers( {
	domains,
	requestingAll,
	items,
	mediaStorage,
	plans,
	guidedTransfer,
	vouchers,
	requesting
} );
