import { omit, merge, get, includes, reduce, isEqual } from 'lodash';
import {
	MEDIA_DELETE,
	SITE_LEAVE_RECEIVE,
	SITE_DELETE_RECEIVE,
	JETPACK_DISCONNECT_RECEIVE,
	JETPACK_SITE_DISCONNECT_REQUEST,
	JETPACK_SITES_FEATURES_FETCH,
	JETPACK_SITES_FEATURES_FETCH_FAILURE,
	JETPACK_SITES_FEATURES_FETCH_SUCCESS,
	SITE_PURCHASES_UPDATE,
	SITE_RECEIVE,
	SITE_REQUEST,
	SITE_REQUEST_FAILURE,
	SITE_REQUEST_SUCCESS,
	SITE_SETTINGS_RECEIVE,
	SITE_SETTINGS_UPDATE,
	SITES_RECEIVE,
	ODYSSEY_SITE_RECEIVE,
	SITES_REQUEST,
	SITES_REQUEST_FAILURE,
	SITES_REQUEST_SUCCESS,
	WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
	SITE_PLUGIN_UPDATED,
	SITE_FRONT_PAGE_UPDATE,
	SITE_MIGRATION_STATUS_UPDATE,
	SITE_RESET,
} from 'calypso/state/action-types';
import { THEME_ACTIVATE_SUCCESS } from 'calypso/state/themes/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import domains from './domains/reducer';
import { featuresReducer as features } from './features/reducer';
import introOffers from './intro-offers/reducer';
import launch from './launch/reducers';
import { plans } from './plans/reducer';
import { products } from './products/reducer';
import { sitesSchema, hasAllSitesListSchema } from './schema';

/**
 * Tracks all known site objects, indexed by site ID.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export const items = withSchemaValidation( sitesSchema, ( state = null, action ) => {
	if (
		state === null &&
		action.type !== SITE_RECEIVE &&
		action.type !== SITES_RECEIVE &&
		action.type !== ODYSSEY_SITE_RECEIVE &&
		action.type !== SITE_RESET
	) {
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

		case SITE_RESET: {
			return omit( state, action.siteId );
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

		case ODYSSEY_SITE_RECEIVE: {
			// Treat the site info from WPCOM as default values for the site, and the info from Odyssey as the source of truth.
			// This is because the site info from WPCOM is more complete, but the info from Odyssey is more up-to-date.
			// For example, `options.is_commercial` is not present in the Odyssey site info, but is a remote option value stored in WPCOM.
			return reduce(
				[ action.site ],
				( memo, site ) => {
					// Bypass if site object hasn't changed
					if ( isEqual( memo[ site.ID ], site ) ) {
						return memo;
					}

					// Avoid mutating state
					if ( memo === state ) {
						memo = { ...state };
					}

					memo[ site.ID ] = {
						...site,
						...memo[ site.ID ],
						options: { ...site?.options, ...memo[ site.ID ]?.options },
						capabilities: { ...site?.capabilities, ...memo[ site.ID ]?.capabilities },
					};
					return memo;
				},
				state
			);
		}

		case SITE_LEAVE_RECEIVE:
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

		// Partial updates for purchases of the site as `site.products`.
		case SITE_PURCHASES_UPDATE: {
			const { siteId, purchases } = action;

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					products: purchases,
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
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @returns {Object}        Updated state
 */
export const requestingAll = ( state = false, action ) => {
	switch ( action.type ) {
		case SITES_REQUEST:
			return true;
		case SITES_REQUEST_FAILURE:
			return false;
		case SITES_REQUEST_SUCCESS:
			return false;
	}

	return state;
};

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks whether a network request is in progress for a site.
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @returns {Object}        Updated state
 */
export const requesting = ( state = {}, action ) => {
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
};

/**
 * Tracks whether all sites have been fetched.
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @returns {Object}        Updated state
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

/**
 * Returns the updated disconnected state after an action has been dispatched.
 * Tracks whether a network request is completed or not.
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @returns {Object}        Updated state
 */
export const jetpackSiteDisconnected = ( state = false, action ) => {
	switch ( action.type ) {
		case JETPACK_SITE_DISCONNECT_REQUEST: {
			return false;
		}
		case JETPACK_DISCONNECT_RECEIVE: {
			return true;
		}
	}
	return state;
};

export const isRequestingJetpackSitesFeatures = ( state = false, action ) => {
	switch ( action.type ) {
		case JETPACK_SITES_FEATURES_FETCH:
			return true;
		case JETPACK_SITES_FEATURES_FETCH_SUCCESS:
		case JETPACK_SITES_FEATURES_FETCH_FAILURE:
			return false;
	}

	return state;
};

export default combineReducers( {
	domains,
	requestingAll,
	introOffers,
	items,
	plans,
	products,
	features,
	requesting,
	hasAllSitesList,
	jetpackSiteDisconnected,
	isRequestingJetpackSitesFeatures,
	launch,
} );
