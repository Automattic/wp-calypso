/** @format */

/**
 * External dependencies
 */

import { mapValues, omit } from 'lodash';

/**
 * Internal dependencies
 */
import ThemeQueryManager from 'lib/query-manager/theme';
import { combineReducers, createReducer } from 'state/utils';
import {
	ACTIVE_THEME_REQUEST,
	ACTIVE_THEME_REQUEST_SUCCESS,
	ACTIVE_THEME_REQUEST_FAILURE,
	DESERIALIZE,
	SERIALIZE,
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
} from 'state/action-types';
import { getSerializedThemesQuery, getThemeIdFromStylesheet } from './utils';
import {
	queriesSchema,
	activeThemesSchema,
	themeFiltersSchema,
	themeRequestErrorsSchema,
} from './schema';
import themesUI from './themes-ui/reducer';
import uploadTheme from './upload-theme/reducer';

/**
 * Returns the updated active theme state after an action has been
 * dispatched. The state reflects a mapping of site ID to theme ID where
 * theme ID represents active theme for the site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const activeThemes = createReducer(
	{},
	{
		[ THEME_ACTIVATE_SUCCESS ]: ( state, { siteId, themeStylesheet } ) => ( {
			...state,
			[ siteId ]: getThemeIdFromStylesheet( themeStylesheet ),
		} ),
		[ ACTIVE_THEME_REQUEST_SUCCESS ]: ( state, { siteId, theme } ) => ( {
			...state,
			[ siteId ]: theme.id,
		} ),
	},
	activeThemesSchema
);

/**
 * Returns the updated theme activation state after an action has been
 * dispatched. The state reflects a mapping of site ID to a boolean
 * reflecting whether a theme is being activated on that site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
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
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const completedActivationRequests = createReducer(
	{},
	{
		[ THEME_ACTIVATE_SUCCESS ]: ( state, { siteId } ) => ( {
			...state,
			[ siteId ]: true,
		} ),
		[ THEME_CLEAR_ACTIVATED ]: ( state, { siteId } ) => ( {
			...state,
			[ siteId ]: false,
		} ),
	}
);

/**
 * Returns the updated active theme request state after an action has been
 * dispatched. The state reflects a mapping of site ID to a boolean
 * reflecting whether a request for active theme is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
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
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
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
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
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
 * object describing request error. If there is no error null is storred.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const themeRequestErrors = createReducer(
	{},
	{
		[ THEME_REQUEST_FAILURE ]: ( state, { siteId, themeId, error } ) => ( {
			...state,
			[ siteId ]: {
				...state[ siteId ],
				[ themeId ]: error,
			},
		} ),
		[ THEME_REQUEST_SUCCESS ]: ( state, { siteId, themeId } ) => ( {
			...state,
			[ siteId ]: omit( state[ siteId ], themeId ),
		} ),
	},
	themeRequestErrorsSchema
);

/**
 * Returns the updated theme query requesting state after an action has been
 * dispatched. The state reflects a mapping of serialized query to whether a
 * network request is in-progress for that query.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function queryRequests( state = {}, action ) {
	switch ( action.type ) {
		case THEMES_REQUEST:
		case THEMES_REQUEST_SUCCESS:
		case THEMES_REQUEST_FAILURE:
			const serializedQuery = getSerializedThemesQuery( action.query, action.siteId );
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
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const queryRequestErrors = createReducer(
	{},
	{
		[ THEMES_REQUEST_FAILURE ]: ( state, { siteId, query, error } ) => {
			const serializedQuery = getSerializedThemesQuery( query, siteId );
			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					[ serializedQuery ]: error,
				},
			};
		},
		[ THEMES_REQUEST_SUCCESS ]: ( state, { siteId, query } ) => {
			const serializedQuery = getSerializedThemesQuery( query, siteId );
			return {
				...state,
				[ siteId ]: omit( state[ siteId ], serializedQuery ),
			};
		},
	}
);

/**
 * Returns the updated theme query state after an action has been dispatched.
 * The state reflects a mapping of serialized query key to an array of theme IDs
 * for the query, if a query response was successfully received.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
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

	// Time after which queries storred in IndexedDb will be invalidated.
	// days * hours_in_day * minutes_in_hour * seconds_in_minute * miliseconds_in_second
	const MAX_THEMES_AGE = 1 * 24 * 60 * 60 * 1000;

	return createReducer(
		{},
		{
			[ THEMES_REQUEST_SUCCESS ]: ( state, { siteId, query, themes, found } ) => {
				return applyToManager(
					// Always 'patch' to avoid overwriting existing fields when receiving
					// from a less rich endpoint such as /mine
					state,
					siteId,
					'receive',
					true,
					themes,
					{ query, found, patch: true }
				);
			},
			[ THEME_DELETE_SUCCESS ]: ( state, { siteId, themeId } ) => {
				return applyToManager( state, siteId, 'removeItem', false, themeId );
			},
			[ SERIALIZE ]: state => {
				const serializedState = mapValues( state, ( { data, options } ) => ( { data, options } ) );
				serializedState._timestamp = Date.now();
				return serializedState;
			},
			[ DESERIALIZE ]: state => {
				if ( state._timestamp && state._timestamp + MAX_THEMES_AGE < Date.now() ) {
					return {};
				}
				const noTimestampState = omit( state, '_timestamp' );
				return mapValues( noTimestampState, ( { data, options } ) => {
					return new ThemeQueryManager( data, options );
				} );
			},
		},
		queriesSchema
	);
} )();

/**
 * Returns the updated themes last query state.
 * The state reflects a mapping of site Id to last query that was issued on that site.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const lastQuery = createReducer(
	{},
	{
		[ THEMES_REQUEST_SUCCESS ]: ( state, { siteId, query } ) => ( {
			...state,
			[ siteId ]: query,
		} ),
	}
);

/**
 * Returns the updated previewing theme state
 * The state holds information about primary and secondary theme actions usable in preview.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const themePreviewOptions = createReducer(
	{},
	{
		[ THEME_PREVIEW_OPTIONS ]: ( state, { primary, secondary } ) => ( {
			primary,
			secondary,
		} ),
	}
);

/**
 * Returns the updated previewing theme state
 * The state reflects if Theme Preview component should be visible or not.
 *
 * @param  {Bool}   state  Current state
 * @param  {Object} action Action payload
 * @return {Bool}          Updated state
 */
export const themePreviewVisibility = createReducer( null, {
	[ THEME_PREVIEW_STATE ]: ( state, { themeId } ) => themeId,
} );

export const themeFilters = createReducer(
	{},
	{
		[ THEME_FILTERS_ADD ]: ( state, { filters } ) => filters,
	},
	themeFiltersSchema
);

export default combineReducers( {
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
} );
