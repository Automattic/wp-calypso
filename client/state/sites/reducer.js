/**
 * External dependencies
 */
import { omit, merge, get, includes, reduce, isEqual, stubFalse, stubTrue } from 'lodash';

/**
 * Internal dependencies
 */
import { plans } from './plans/reducer';
import { products } from './products/reducer';
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
	WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
	SITE_PLUGIN_UPDATED,
	SITE_FRONT_PAGE_UPDATE,
	SITE_MIGRATION_STATUS_UPDATE,
} from 'calypso/state/action-types';
import { THEME_ACTIVATE_SUCCESS } from 'calypso/state/themes/action-types';
import { sitesSchema, hasAllSitesListSchema } from './schema';
import {
	combineReducers,
	keyedReducer,
	withSchemaValidation,
	withoutPersistence,
} from 'calypso/state/utils';

/**
 * Tracks all known site objects, indexed by site ID.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const items = withSchemaValidation( sitesSchema, ( state = null, action ) => {
	if ( state === null && action.type !== SITE_RECEIVE && action.type !== SITES_RECEIVE ) {
		return null;
	}
	switch ( action.type ) {
		case WORDADS_SITE_APPROVE_REQUEST_SUCCESS: {
			const prevSite = state[ action.siteId ];
			if ( prevSite ) {
				return Object.assign( {}, state, {
					[ action.siteId ]: merge( {}, prevSite, { options: { wordads: true } } ),
				} );
			}
			return state;
		}

		case SITE_RECEIVE:
		case SITES_RECEIVE: {
			// Normalize incoming site(s) to array

			const sites = action.site ? [ action.site ] : action.sites;

			// SITES_RECEIVE occurs when we receive the entire set of user
			// sites (replace existing state). Otherwise merge into state.

			const initialNextState = SITES_RECEIVE === action.type ? {} : state;

			return reduce(
				sites,
				( memo, site ) => {
					// Bypass if site object hasn't changed
					if ( isEqual( memo[ site.ID ], site ) ) {
						return memo;
					}

					// Avoid mutating state
					if ( memo === state ) {
						memo = { ...state };
					}

					memo[ site.ID ] = site;
					return memo;
				},
				initialNextState || {}
			);
		}

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
				[ 'blog_public', 'wpcom_public_coming_soon', 'wpcom_coming_soon', 'site_icon' ],
				( memo, key ) => {
					// A site settings update may or may not include the icon or blog_public property.
					// If not, we should simply return state unchanged.
					if ( ! settings.hasOwnProperty( key ) ) {
						return memo;
					}

					switch ( key ) {
						case 'blog_public': {
							const isPrivate = parseInt( settings.blog_public, 10 ) === -1;

							if ( site.is_private === isPrivate ) {
								return memo;
							}

							nextSite = {
								...nextSite,
								is_private: isPrivate,
							};
							break;
						}
						case 'wpcom_coming_soon':
						case 'wpcom_public_coming_soon': {
							const isComingSoon =
								parseInt( settings.wpcom_public_coming_soon, 10 ) === 1 ||
								parseInt( settings.wpcom_coming_soon, 10 ) === 1;

							if ( site.is_coming_soon === isComingSoon ) {
								return memo;
							}

							nextSite = {
								...nextSite,
								is_coming_soon: isComingSoon,
							};
							break;
						}
						case 'site_icon': {
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

		case SITE_FRONT_PAGE_UPDATE: {
			const { siteId, frontPageOptions } = action;
			const site = state[ siteId ];
			if ( ! site ) {
				break;
			}

			return {
				...state,
				[ siteId ]: merge( {}, site, {
					options: {
						...frontPageOptions,
					},
				} ),
			};
		}

		case SITE_MIGRATION_STATUS_UPDATE: {
			const { siteId, migrationStatus, lastModified } = action;
			const site = state[ siteId ];
			if ( ! site ) {
				return state;
			}

			const siteMigrationMeta = state[ siteId ].site_migration || {};
			const newMeta = { status: migrationStatus };
			if ( lastModified ) {
				newMeta.last_modified = lastModified;
			}

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					site_migration: merge( {}, siteMigrationMeta, newMeta ),
				},
			};
		}
	}

	return state;
} );

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks whether a network request is in progress for all
 * sites.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action object
 * @returns {object}        Updated state
 */
export const requestingAll = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case SITES_REQUEST:
			return true;
		case SITES_REQUEST_FAILURE:
			return false;
		case SITES_REQUEST_SUCCESS:
			return false;
	}

	return state;
} );

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks whether a network request is in progress for a site.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action object
 * @returns {object}        Updated state
 */
export const requesting = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_REQUEST: {
			const { siteId } = action;
			return { ...state, [ siteId ]: true };
		}
		case SITE_REQUEST_FAILURE: {
			const { siteId } = action;
			return { ...state, [ siteId ]: false };
		}
		case SITE_REQUEST_SUCCESS: {
			const { siteId } = action;
			return { ...state, [ siteId ]: false };
		}
	}

	return state;
} );

/**
 * Returns the updated deleting state after an action has been dispatched.
 * Deleting state tracks whether a network request is in progress for a site.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action object
 * @returns {object}        Updated state
 */
export const deleting = keyedReducer(
	'siteId',
	withoutPersistence( ( state = {}, action ) => {
		switch ( action.type ) {
			case SITE_DELETE:
				return stubTrue( state, action );
			case SITE_DELETE_FAILURE:
				return stubFalse( state, action );
			case SITE_DELETE_SUCCESS:
				return stubFalse( state, action );
		}

		return state;
	} )
);

/**
 * Tracks whether all sites have been fetched.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action object
 * @returns {object}        Updated state
 */
export const hasAllSitesList = withSchemaValidation(
	hasAllSitesListSchema,
	( state = false, action ) => {
		switch ( action.type ) {
			case SITES_RECEIVE:
				return true;
		}

		return state;
	}
);

export default combineReducers( {
	connection,
	deleting,
	domains,
	requestingAll,
	items,
	mediaStorage,
	plans,
	products,
	guidedTransfer,
	monitor,
	vouchers,
	requesting,
	sharingButtons,
	blogStickers,
	hasAllSitesList,
} );
