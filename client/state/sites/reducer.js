/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { pick, omit, merge, get, includes } from 'lodash';

/**
 * Internal dependencies
 */
import { plans } from './plans/reducer';
import domains from './domains/reducer';
import guidedTransfer from './guided-transfer/reducer';
import vouchers from './vouchers/reducer';
import updates from './updates/reducer';
import sharingButtons from './sharing-buttons/reducer';

import mediaStorage from './media-storage/reducer';
import {
	MEDIA_DELETE,
	SITE_FRONT_PAGE_SET_SUCCESS,
	SITE_RECEIVE,
	SITE_REQUEST,
	SITE_REQUEST_FAILURE,
	SITE_REQUEST_SUCCESS,
	SITE_SETTINGS_RECEIVE,
	SITE_SETTINGS_UPDATE,
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
			const { siteId, updatedOptions } = action;
			const site = state[ siteId ];
			if ( ! site ) {
				break;
			}

			return {
				...state,
				[ siteId ]: merge( {}, site, {
					options: updatedOptions,
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

		case THEME_ACTIVATE_REQUEST_SUCCESS: {
			const { siteId, themeStylesheet } = action;
			const site = state[ siteId ];
			if ( ! site ) {
				break;
			}

			return {
				...state,
				[ siteId ]: merge( {}, site, {
					options: {
						theme_slug: themeStylesheet
					}
				} )
			};
		}

		case SITE_SETTINGS_UPDATE:
		case SITE_SETTINGS_RECEIVE: {
			const { siteId, settings } = action;

			// A site settings update may or may not include the icon property.
			// If not, we should simply return state unchanged.
			if ( ! settings.hasOwnProperty( 'site_icon' ) ) {
				return state;
			}

			const mediaId = settings.site_icon;

			// Similarly, return unchanged if next icon matches current value,
			// accounting for the fact that a non-existent icon property is
			// equivalent to setting the media icon as null
			const site = state[ siteId ];
			if ( ! site || get( site.icon, 'media_id', null ) === mediaId ) {
				return state;
			}

			let nextSite;
			if ( null === mediaId ) {
				// Unset icon
				nextSite = omit( site, 'icon' );
			} else {
				// Update icon, intentionally removing reference to the URL,
				// shifting burden of URL lookup to selector
				nextSite = {
					...site,
					icon: {
						media_id: mediaId
					}
				};
			}

			return {
				...state,
				[ siteId ]: nextSite
			};
		}

		case MEDIA_DELETE: {
			const { siteId, mediaIds } = action;
			const siteIconId = get( state[ siteId ], 'icon.media_id' );
			if ( siteIconId && includes( mediaIds, siteIconId ) ) {
				return {
					...state,
					[ siteId ]: omit( state[ siteId ], 'icon' )
				};
			}

			return state;
		}

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
	requesting,
	sharingButtons,
} );
