/**
 * External dependencies
 */
import { mapValues, omit, map } from 'lodash';

/**
 * Internal dependencies
 */
import ThemeQueryManager from 'calypso/lib/query-manager/theme';
import {
	combineReducers,
	withSchemaValidation,
	withStorageKey,
	withoutPersistence,
} from 'calypso/state/utils';
import {
	ACTIVE_THEME_REQUEST,
	ACTIVE_THEME_REQUEST_SUCCESS,
	ACTIVE_THEME_REQUEST_FAILURE,
	RECOMMENDED_THEMES_FAIL,
	RECOMMENDED_THEMES_FETCH,
	RECOMMENDED_THEMES_SUCCESS,
	THEME_ACTIVATE,
	THEME_ACTIVATE_SUCCESS,
	THEME_ACTIVATE_FAILURE,
	THEME_CLEAR_ACTIVATED,
	THEME_DELETE_SUCCESS,
	THEME_FILTERS_ADD,
	THEME_INSTALL,
	THEME_INSTALL_SUCCESS,
	THEME_INSTALL_FAILURE,
	THEME_REQUEST,
	THEME_REQUEST_SUCCESS,
	THEME_REQUEST_FAILURE,
	THEMES_REQUEST,
	THEMES_REQUEST_SUCCESS,
	THEMES_REQUEST_FAILURE,
	THEME_PREVIEW_OPTIONS,
	THEME_PREVIEW_STATE,
	THEME_SHOW_AUTO_LOADING_HOMEPAGE_WARNING,
	THEME_HIDE_AUTO_LOADING_HOMEPAGE_WARNING,
	THEME_ACCEPT_AUTO_LOADING_HOMEPAGE_WARNING,
} from 'calypso/state/themes/action-types';
import { DESERIALIZE, SERIALIZE } from 'calypso/state/action-types';
import { getSerializedThemesQuery, getThemeIdFromStylesheet } from './utils';
import {
	queriesSchema,
	activeThemesSchema,
	themeFiltersSchema,
	themeRequestErrorsSchema,
} from './schema';
import themesUI from './themes-ui/reducer';
import uploadTheme from './upload-theme/reducer';
import { decodeEntities } from 'calypso/lib/formatting';

/**
 * Returns the updated active theme state after an action has been
 * dispatched. The state reflects a mapping of site ID to theme ID where
 * theme ID represents active theme for the site.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const activeThemes = withSchemaValidation( activeThemesSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case THEME_ACTIVATE_SUCCESS: {
			const { siteId, themeStylesheet } = action;

			return {
				...state,
				[ siteId ]: getThemeIdFromStylesheet( themeStylesheet ),
			};
		}
		case ACTIVE_THEME_REQUEST_SUCCESS: {
			const { siteId, theme } = action;

			return {
				...state,
				[ siteId ]: theme.id,
			};
		}
	}

	return state;
} );

/**
 * Returns the updated theme activation state after an action has been
 * dispatched. The state reflects a mapping of site ID to a boolean
 * reflecting whether a theme is being activated on that site.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function activationRequests( state = {}, action ) {
	switch ( action.type ) {
		case THEME_ACTIVATE:
		case THEME_ACTIVATE_SUCCESS:
		case THEME_ACTIVATE_FAILURE:
			return {
				...state,
				[ action.siteId ]: THEME_ACTIVATE === action.type,
			};
	}

	return state;
}

/**
 * Returns the updated completed theme activation requess state after an action has been
 * dispatched. The state reflects a mapping of site ID to boolean, reflecting whether
 * activation request has finished or has been cleared.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const completedActivationRequests = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case THEME_ACTIVATE_SUCCESS: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: true,
			};
		}
		case THEME_CLEAR_ACTIVATED: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: false,
			};
		}
	}

	return state;
} );

/**
 * Returns the updated active theme request state after an action has been
 * dispatched. The state reflects a mapping of site ID to a boolean
 * reflecting whether a request for active theme is in progress.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function activeThemeRequests( state = {}, action ) {
	switch ( action.type ) {
		case ACTIVE_THEME_REQUEST:
		case ACTIVE_THEME_REQUEST_SUCCESS:
		case ACTIVE_THEME_REQUEST_FAILURE:
			return {
				...state,
				[ action.siteId ]: ACTIVE_THEME_REQUEST === action.type,
			};
	}

	return state;
}

/**
 * Returns the updated site theme requests state after an action has been
 * dispatched. The state reflects a mapping of site ID, theme ID pairing to a
 * boolean reflecting whether a request for the theme is in progress.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function themeRequests( state = {}, action ) {
	switch ( action.type ) {
		case THEME_REQUEST:
		case THEME_REQUEST_SUCCESS:
		case THEME_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign( {}, state[ action.siteId ], {
					[ action.themeId ]: THEME_REQUEST === action.type,
				} ),
			} );
	}

	return state;
}

/**
 * Returns the updated Jetpack site wpcom theme install requests state after an action has been
 * dispatched. The state reflects a mapping of site ID, theme ID pairing to a
 * boolean reflecting whether a request for the theme install is in progress.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function themeInstalls( state = {}, action ) {
	switch ( action.type ) {
		case THEME_INSTALL:
		case THEME_INSTALL_SUCCESS:
		case THEME_INSTALL_FAILURE:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign( {}, state[ action.siteId ], {
					[ action.themeId ]: THEME_INSTALL === action.type,
				} ),
			} );
	}

	return state;
}

/**
 * Returns the updated site theme requests error state after an action has been
 * dispatched. The state reflects a mapping of site ID, theme ID pairing to a
 * object describing request error. If there is no error null is stored.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const themeRequestErrors = withSchemaValidation(
	themeRequestErrorsSchema,
	( state = {}, action ) => {
		switch ( action.type ) {
			case THEME_REQUEST_FAILURE: {
				const { siteId, themeId, error } = action;

				return {
					...state,
					[ siteId ]: {
						...state[ siteId ],
						[ themeId ]: error,
					},
				};
			}
			case THEME_REQUEST_SUCCESS: {
				const { siteId, themeId } = action;

				return {
					...state,
					[ siteId ]: omit( state[ siteId ], themeId ),
				};
			}
		}

		return state;
	}
);

/**
 * Returns the updated theme query requesting state after an action has been
 * dispatched. The state reflects a mapping of serialized query to whether a
 * network request is in-progress for that query.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function queryRequests( state = {}, action ) {
	let serializedQuery;

	switch ( action.type ) {
		case THEMES_REQUEST:
		case THEMES_REQUEST_SUCCESS:
		case THEMES_REQUEST_FAILURE:
			serializedQuery = getSerializedThemesQuery( action.query, action.siteId );
			return Object.assign( {}, state, {
				[ serializedQuery ]: THEMES_REQUEST === action.type,
			} );
	}

	return state;
}

/**
 * Returns the updated query request error state after an action has been
 * dispatched. The state reflects a mapping of site ID, query ID pairing to an
 * object containing the request error. If there is no error null is stored.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const queryRequestErrors = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case THEMES_REQUEST_FAILURE: {
			const { siteId, query, error } = action;
			const serializedQuery = getSerializedThemesQuery( query, siteId );
			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					[ serializedQuery ]: error,
				},
			};
		}
		case THEMES_REQUEST_SUCCESS: {
			const { siteId, query } = action;
			const serializedQuery = getSerializedThemesQuery( query, siteId );
			return {
				...state,
				[ siteId ]: omit( state[ siteId ], serializedQuery ),
			};
		}
	}

	return state;
} );

/**
 * Returns the updated theme query state after an action has been dispatched.
 * The state reflects a mapping of serialized query key to an array of theme IDs
 * for the query, if a query response was successfully received.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const queries = ( () => {
	function applyToManager( state, siteId, method, createDefault, ...args ) {
		if ( ! state[ siteId ] ) {
			if ( ! createDefault ) {
				return state;
			}

			return {
				...state,
				[ siteId ]: new ThemeQueryManager( null, { itemKey: 'id' } )[ method ]( ...args ),
			};
		}

		const nextManager = state[ siteId ][ method ]( ...args );
		if ( nextManager === state[ siteId ] ) {
			return state;
		}

		return {
			...state,
			[ siteId ]: nextManager,
		};
	}

	function fromApi( theme ) {
		if ( ! theme || ! theme.description ) {
			return theme;
		}

		return { ...theme, description: decodeEntities( theme.description ) };
	}

	// Time after which queries stored in IndexedDb will be invalidated.
	// days * hours_in_day * minutes_in_hour * seconds_in_minute * miliseconds_in_second
	const MAX_THEMES_AGE = 1 * 24 * 60 * 60 * 1000;

	return withSchemaValidation( queriesSchema, ( state = {}, action ) => {
		switch ( action.type ) {
			case THEMES_REQUEST_SUCCESS: {
				const { siteId, query, themes, found } = action;
				return applyToManager(
					// Always 'patch' to avoid overwriting existing fields when receiving
					// from a less rich endpoint such as /mine
					state,
					siteId,
					'receive',
					true,
					map( themes, fromApi ),
					{ query, found, patch: true }
				);
			}
			case THEME_DELETE_SUCCESS: {
				const { siteId, themeId } = action;
				return applyToManager( state, siteId, 'removeItem', false, themeId );
			}
			case SERIALIZE: {
				const serializedState = mapValues( state, ( { data, options } ) => ( { data, options } ) );
				serializedState._timestamp = Date.now();
				return serializedState;
			}
			case DESERIALIZE: {
				if ( state._timestamp && state._timestamp + MAX_THEMES_AGE < Date.now() ) {
					return {};
				}
				const noTimestampState = omit( state, '_timestamp' );
				return mapValues( noTimestampState, ( { data, options } ) => {
					return new ThemeQueryManager( data, options );
				} );
			}
		}

		return state;
	} );
} )();

/**
 * Returns the updated themes last query state.
 * The state reflects a mapping of site Id to last query that was issued on that site.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const lastQuery = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case THEMES_REQUEST_SUCCESS: {
			const { siteId, query } = action;

			return {
				...state,
				[ siteId ]: query,
			};
		}
	}

	return state;
} );

/**
 * Returns the updated previewing theme state
 * The state holds information about primary and secondary theme actions usable in preview.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const themePreviewOptions = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case THEME_PREVIEW_OPTIONS: {
			const { primary, secondary } = action;

			return {
				primary,
				secondary,
			};
		}
	}

	return state;
} );

/**
 * Returns the updated previewing theme state
 * The state reflects if Theme Preview component should be visible or not.
 *
 * @param  {boolean}   state  Current state
 * @param  {object} action Action payload
 * @returns {boolean}          Updated state
 */
export const themePreviewVisibility = withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case THEME_PREVIEW_STATE: {
			const { themeId } = action;
			return themeId;
		}
	}

	return state;
} );

export const themeHasAutoLoadingHomepageWarning = withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case THEME_SHOW_AUTO_LOADING_HOMEPAGE_WARNING: {
			return {
				themeId: action.themeId,
				show: true,
				accepted: false,
			};
		}

		case THEME_ACCEPT_AUTO_LOADING_HOMEPAGE_WARNING: {
			return {
				themeId: action.themeId,
				show: false,
				accepted: true,
			};
		}

		case THEME_ACTIVATE:
		case THEME_ACTIVATE_SUCCESS:
		case THEME_ACTIVATE_FAILURE:
		case THEME_HIDE_AUTO_LOADING_HOMEPAGE_WARNING: {
			return null;
		}
	}

	return state;
} );

export const themeFilters = withSchemaValidation( themeFiltersSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case THEME_FILTERS_ADD: {
			const { filters } = action;
			return filters;
		}
	}

	return state;
} );

/**
 * Returns updated state for recommended themes after
 * corresponding actions have been dispatched.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function recommendedThemes( state = { isLoading: true, themes: [] }, action ) {
	switch ( action.type ) {
		case RECOMMENDED_THEMES_FETCH:
			return { ...state, isLoading: true };
		case RECOMMENDED_THEMES_SUCCESS:
			return { ...state, isLoading: false, themes: action.payload.themes };
		case RECOMMENDED_THEMES_FAIL:
			return { ...state, isLoading: false };
	}

	return state;
}

const combinedReducer = combineReducers( {
	queries,
	queryRequests,
	queryRequestErrors,
	lastQuery,
	themeInstalls,
	themeRequests,
	themeRequestErrors,
	activeThemes,
	activeThemeRequests,
	activationRequests,
	completedActivationRequests,
	themesUI,
	uploadTheme,
	themePreviewOptions,
	themePreviewVisibility,
	themeFilters,
	recommendedThemes,
	themeHasAutoLoadingHomepageWarning,
} );
const themesReducer = withStorageKey( 'themes', combinedReducer );

export default themesReducer;
