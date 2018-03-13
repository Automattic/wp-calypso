/** @format */

/**
 * External dependencies
 */

import { pick, omit, merge, get, includes, reduce, isEqual, stubFalse, stubTrue } from 'lodash';

/**
 * Internal dependencies
 */
import { plans } from './plans/reducer';
import connection from './connection/reducer';
import domains from './domains/reducer';
import guidedTransfer from './guided-transfer/reducer';
import monitor from './monitor/reducer';
import vouchers from './vouchers/reducer';
import sharingButtons from './sharing-buttons/reducer';
import mediaStorage from './media-storage/reducer';
import blogStickers from './blog-stickers/reducer';
import {
	MEDIA_DELETE,
	SITE_DELETE,
	SITE_DELETE_FAILURE,
	SITE_DELETE_SUCCESS,
	SITE_DELETE_RECEIVE,
	JETPACK_DISCONNECT_RECEIVE,
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
	THEME_ACTIVATE_SUCCESS,
	WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
	SITE_PLUGIN_UPDATED,
} from 'state/action-types';
import { sitesSchema, hasAllSitesListSchema } from './schema';
import { combineReducers, createReducer, keyedReducer } from 'state/utils';

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
export function items( state = null, action ) {
	if ( state === null && action.type !== SITE_RECEIVE && action.type !== SITES_RECEIVE ) {
		return null;
	}
	switch ( action.type ) {
		case WORDADS_SITE_APPROVE_REQUEST_SUCCESS:
			const prevSite = state[ action.siteId ];
			if ( prevSite ) {
				return Object.assign( {}, state, {
					[ action.siteId ]: merge( {}, prevSite, { options: { wordads: true } } ),
				} );
			}
			return state;

		case SITE_RECEIVE:
		case SITES_RECEIVE:
			// Normalize incoming site(s) to array
			const sites = action.site ? [ action.site ] : action.sites;

			// SITES_RECEIVE occurs when we receive the entire set of user
			// sites (replace existing state). Otherwise merge into state.
			const initialNextState = SITES_RECEIVE === action.type ? {} : state;

			return reduce(
				sites,
				( memo, site ) => {
					// Bypass if site object hasn't change
					const transformedSite = pick( site, VALID_SITE_KEYS );
					if ( isEqual( memo[ site.ID ], transformedSite ) ) {
						return memo;
					}

					// Avoid mutating state
					if ( memo === state ) {
						memo = { ...state };
					}

					memo[ site.ID ] = transformedSite;
					return memo;
				},
				initialNextState || {}
			);

		case SITE_DELETE_RECEIVE:
		case JETPACK_DISCONNECT_RECEIVE:
			return omit( state, action.siteId );

		case THEME_ACTIVATE_SUCCESS: {
			const { siteId, themeStylesheet } = action;
			const site = state[ siteId ];
			if ( ! site ) {
				break;
			}

			return {
				...state,
				[ siteId ]: merge( {}, site, {
					options: {
						theme_slug: themeStylesheet,
					},
				} ),
			};
		}

		case SITE_SETTINGS_UPDATE:
		case SITE_SETTINGS_RECEIVE: {
			const { siteId, settings } = action;
			const site = state[ siteId ];

			if ( ! site ) {
				return state;
			}

			let nextSite = site;

			return reduce(
				[ 'blog_public', 'site_icon' ],
				( memo, key ) => {
					// A site settings update may or may not include the icon or blog_public property.
					// If not, we should simply return state unchanged.
					if ( ! settings.hasOwnProperty( key ) ) {
						return memo;
					}

					switch ( key ) {
						case 'blog_public':
							const isPrivate = parseInt( settings.blog_public, 10 ) === -1;

							if ( site.is_private === isPrivate ) {
								return memo;
							}

							nextSite = {
								...nextSite,
								is_private: isPrivate,
							};
							break;
						case 'site_icon':
							const mediaId = settings.site_icon;
							// Return unchanged if next icon matches current value,
							// accounting for the fact that a non-existent icon property is
							// equivalent to setting the media icon as null
							if (
								( ! site.icon && null === mediaId ) ||
								( site.icon && site.icon.media_id === mediaId )
							) {
								return memo;
							}

							if ( null === mediaId ) {
								// Unset icon
								nextSite = omit( nextSite, 'icon' );
							} else {
								// Update icon, intentionally removing reference to the URL,
								// shifting burden of URL lookup to selector
								nextSite = {
									...nextSite,
									icon: {
										media_id: mediaId,
									},
								};
							}
							break;
					}

					if ( memo === state ) {
						memo = { ...state };
					}

					memo[ siteId ] = nextSite;
					return memo;
				},
				state
			);
		}

		case MEDIA_DELETE: {
			const { siteId, mediaIds } = action;
			const siteIconId = get( state[ siteId ], 'icon.media_id' );
			if ( siteIconId && includes( mediaIds, siteIconId ) ) {
				return {
					...state,
					[ siteId ]: omit( state[ siteId ], 'icon' ),
				};
			}

			return state;
		}

		case SITE_PLUGIN_UPDATED: {
			const { siteId } = action;
			const siteUpdates = get( state[ siteId ], 'updates' );
			if ( ! siteUpdates ) {
				return state;
			}

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					updates: {
						...siteUpdates,
						plugins: siteUpdates.plugins - 1,
						total: siteUpdates.total - 1,
					},
				},
			};
		}
	}

	return state;
}
items.schema = sitesSchema;

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
	[ SITES_REQUEST_SUCCESS ]: () => false,
} );

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks whether a network request is in progress for a site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @return {Object}        Updated state
 */
export const requesting = createReducer(
	{},
	{
		[ SITE_REQUEST ]: ( state, { siteId } ) => {
			return { ...state, [ siteId ]: true };
		},
		[ SITE_REQUEST_FAILURE ]: ( state, { siteId } ) => {
			return { ...state, [ siteId ]: false };
		},
		[ SITE_REQUEST_SUCCESS ]: ( state, { siteId } ) => {
			return { ...state, [ siteId ]: false };
		},
	}
);

/**
 * Returns the updated deleting state after an action has been dispatched.
 * Deleting state tracks whether a network request is in progress for a site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @return {Object}        Updated state
 */
export const deleting = keyedReducer(
	'siteId',
	createReducer(
		{},
		{
			[ SITE_DELETE ]: stubTrue,
			[ SITE_DELETE_FAILURE ]: stubFalse,
			[ SITE_DELETE_SUCCESS ]: stubFalse,
		}
	)
);

/**
 * Tracks whether all sites have been fetched.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @return {Object}        Updated state
 */
export const hasAllSitesList = createReducer(
	false,
	{
		[ SITES_RECEIVE ]: () => true,
	},
	hasAllSitesListSchema
);

export default combineReducers( {
	connection,
	deleting,
	domains,
	requestingAll,
	items,
	mediaStorage,
	plans,
	guidedTransfer,
	monitor,
	vouchers,
	requesting,
	sharingButtons,
	blogStickers,
	hasAllSitesList,
} );
