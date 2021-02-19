/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import {
	fetchPluginInformation,
	fetchPluginsList as fetchWporgPluginsList,
} from 'calypso/lib/wporg';
import { normalizePluginData, normalizePluginsList } from 'calypso/lib/plugins/utils';
import {
	PLUGINS_WPORG_LIST_RECEIVE,
	PLUGINS_WPORG_LIST_REQUEST,
	PLUGINS_WPORG_PLUGIN_RECEIVE,
	PLUGINS_WPORG_PLUGIN_REQUEST,
} from 'calypso/state/action-types';
import {
	getNextPluginsListPage,
	isFetching,
	isFetchingPluginsList,
} from 'calypso/state/plugins/wporg/selectors';

import 'calypso/state/plugins/init';

const PLUGINS_LIST_DEFAULT_SIZE = 24;

export function fetchPluginData( pluginSlug ) {
	return async ( dispatch, getState ) => {
		if ( isFetching( getState(), pluginSlug ) ) {
			return;
		}

		dispatch( {
			type: PLUGINS_WPORG_PLUGIN_REQUEST,
			pluginSlug,
		} );

		try {
			const data = await fetchPluginInformation( pluginSlug );

			dispatch( {
				type: PLUGINS_WPORG_PLUGIN_RECEIVE,
				pluginSlug,
				data: normalizePluginData( { detailsFetched: Date.now() }, data ),
			} );
		} catch ( error ) {
			dispatch( {
				type: PLUGINS_WPORG_PLUGIN_RECEIVE,
				pluginSlug,
				error,
			} );
		}
	};
}

/**
 * Helper thunk for receiving a specific data or retrieve error of plugins list.
 * Handles plugin list normalization internally.
 *
 * @param {string} category   Plugin category
 * @param {number} page       Page (1-based)
 * @param {string} searchTerm Search term
 * @param {Array}  data       List of found plugins, not defined if there was an error
 * @param {object} error      Error object, undefined if the plugins were fetched successfully
 * @param {object} pagination Paginatioin data, as retrieved from the API response.
 * @returns {object}          Action object
 */
function receivePluginsList( category, page, searchTerm, data, error, pagination = null ) {
	return {
		type: PLUGINS_WPORG_LIST_RECEIVE,
		category,
		page,
		searchTerm,
		data: normalizePluginsList( data ),
		pagination,
		error,
	};
}

/**
 * Retrieve a list of pliugins, identified by category and page number, or a search term.
 *
 * WP.org plugins can be filtered either by category or search term.
 * Pagination is supported only for category queries.
 * Category can be one of "featured", "popular", "new", "beta" or "recommended".
 * Search term is an open text field.
 *
 * @param {string} category   Plugin category
 * @param {number} page       Page (1-based)
 * @param {string} searchTerm Search term
 * @returns {Function} Action thunk
 */
export function fetchPluginsList( category, page, searchTerm ) {
	return ( dispatch, getState ) => {
		// Bail if we are currently fetching this plugins list
		if ( isFetchingPluginsList( getState(), category, searchTerm ) ) {
			return;
		}

		dispatch( {
			type: PLUGINS_WPORG_LIST_REQUEST,
			category,
			page,
			searchTerm,
		} );

		// The "Featured" category is managed by WP.com instead of WP.org
		if ( 'featured' === category ) {
			wpcom
				.undocumented()
				.getFeaturedPlugins()
				.then( ( data ) => {
					dispatch( receivePluginsList( category, page, searchTerm, data, null ) );
				} )
				.catch( ( error ) => {
					dispatch( receivePluginsList( category, page, searchTerm, [], error ) );
				} );
			return;
		}

		fetchWporgPluginsList(
			{
				pageSize: PLUGINS_LIST_DEFAULT_SIZE,
				page,
				category,
				search: searchTerm,
			},
			function ( error, data ) {
				dispatch(
					receivePluginsList( category, page, searchTerm, data?.plugins ?? [], error, data?.info )
				);
			}
		);
	};
}

/**
 * Retrieve the next page of plugins for the specified category.
 * Pagination is currently supported only for category queries in the API.
 *
 * @param {string} category   Plugin category
 * @returns {Function} Action thunk
 */
export function fetchPluginsCategoryNextPage( category ) {
	return ( dispatch, getState ) => {
		const state = getState();

		// Bail if we are currently fetching this plugins list
		const nextPage = getNextPluginsListPage( state, category );
		if ( ! nextPage ) {
			return;
		}
		dispatch( fetchPluginsList( category, nextPage, undefined ) );
	};
}
