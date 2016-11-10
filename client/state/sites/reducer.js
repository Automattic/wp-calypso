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
import updates from './updates/reducer';

import mediaStorage from './media-storage/reducer';
import {
	SITE_FRONT_PAGE_SET_SUCCESS,
	SITE_RECEIVE,
	SITE_REQUEST,
	SITE_REQUEST_FAILURE,
	SITE_REQUEST_SUCCESS,
	SITES_RECEIVE,
	SITES_REQUEST,
	SITES_REQUEST_FAILURE,
	SITES_REQUEST_SUCCESS,
	DESERIALIZE,
	THEME_ACTIVATE_REQUEST_SUCCESS,
	WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
	PRESSABLE_TRANSFER_START,
	PRESSABLE_TRANSFER_SUCCESS,
} from 'state/action-types';
import { sitesSchema } from './schema';
import { isValidStateWithSchema, createReducer } from 'state/utils';
import { PRESSABLE_STATE_TRANSFERED, PRESSABLE_STATE_IN_TRANSFER } from './constants';

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
		case SITE_FRONT_PAGE_SET_SUCCESS: {
			const { siteId, pageId } = action;
			const site = state[ siteId ];
			if ( ! site ) {
				break;
			}

			return {
				...state,
				[ siteId ]: merge( {}, site, {
					options: {
						show_on_front: pageId === 0 ? 'posts' : 'page',
						page_on_front: pageId
					}
				} )
			};
		}

		case WORDADS_SITE_APPROVE_REQUEST_SUCCESS:
			const prevSite = state[ action.siteId ];
			if ( prevSite ) {
				return Object.assign( {}, state, {
					[ action.siteId ]: merge( {}, prevSite, { options: { wordads: true } } )
				} );
			}
			return state;

		case PRESSABLE_TRANSFER_START: {
			const originalSite = state[ action.siteId ];
			if ( originalSite ) {
				return Object.assign( {}, state, {
					[ action.siteId ]: merge( {}, originalSite, { jetpack: true, options: { pressable: PRESSABLE_STATE_IN_TRANSFER } } )
				} );
			}
			return state;
		}

		case PRESSABLE_TRANSFER_SUCCESS: {
			const originalSite = state[ action.siteId ];
			if ( originalSite ) {
				return Object.assign( {}, state, {
					[ action.siteId ]: merge( {}, originalSite, { jetpack: true, options: { pressable: PRESSABLE_STATE_TRANSFERED } } )
				} );
			}
			return state;
		}

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

		case THEME_ACTIVATE_REQUEST_SUCCESS:
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
	updates,
	requesting
} );
