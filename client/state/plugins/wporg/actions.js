/**
 * External dependencies
 */
import { get } from 'lodash';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:wporg-data:actions' );

/**
 * Internal dependencies
 */
import Dispatcher from 'calypso/dispatcher';
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
	isFetchingPluginsList,
} from 'calypso/state/plugins/wporg/selectors';

import 'calypso/state/plugins/init';

const PLUGINS_LIST_DEFAULT_SIZE = 24;

// TODO: fix the selector in `selectors.js` to not return `true` by default
function isFetching( state, pluginSlug ) {
	return get( state, [ 'plugins', 'wporg', 'fetchingItems', pluginSlug ], false );
}

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

			debug( 'plugin details fetched from .org', pluginSlug, data );
			dispatch( {
				type: PLUGINS_WPORG_PLUGIN_RECEIVE,
				pluginSlug,
				data: normalizePluginData( { detailsFetched: Date.now() }, data ),
			} );
		} catch ( error ) {
			debug( 'plugin details failed to fetch from .org', pluginSlug, error );
			dispatch( {
				type: PLUGINS_WPORG_PLUGIN_RECEIVE,
				pluginSlug,
				error,
			} );
		}
	};
}

function receivePluginsList( category, page, searchTerm, data, error, pagination = null ) {
	return ( dispatch ) =>
		dispatch( {
			type: PLUGINS_WPORG_LIST_RECEIVE,
			category,
			page,
			searchTerm,
			data: normalizePluginsList( data ),
			pagination,
			error,
		} );
}

/**
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

		// @TODO: Remove when this flux action is completely reduxified
		Dispatcher.handleViewAction( {
			type: 'FETCH_WPORG_PLUGINS_LIST',
			action: 'FETCH_WPORG_PLUGINS_LIST',
			page,
			category,
			searchTerm,
		} );

		// The "Featured" category is managed by WP.com instead of WP.org
		if ( 'featured' === category ) {
			wpcom
				.undocumented()
				.getFeaturedPlugins()
				.then( ( data ) => {
					dispatch( receivePluginsList( category, page, searchTerm, data, null ) );

					// @TODO: Remove when this flux action is completely reduxified
					Dispatcher.handleServerAction( {
						type: 'RECEIVE_WPORG_PLUGINS_LIST',
						action: 'FETCH_WPORG_PLUGINS_LIST',
						page: 1,
						category: 'featured',
						data: normalizePluginsList( data ),
						error: null,
					} );
				} )
				.catch( ( error ) => {
					dispatch( receivePluginsList( category, page, searchTerm, [], error ) );

					// @TODO: Remove when this flux action is completely reduxified
					Dispatcher.handleServerAction( {
						type: 'RECEIVE_WPORG_PLUGINS_LIST',
						action: 'FETCH_WPORG_PLUGINS_LIST',
						page: 1,
						category: 'featured',
						data: normalizePluginsList( [] ),
						error: null,
					} );
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

				// @TODO: Remove when this flux action is completely reduxified
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_WPORG_PLUGINS_LIST',
					action: 'FETCH_WPORG_PLUGINS_LIST',
					page,
					category,
					data: data ? normalizePluginsList( data?.plugins ) : null,
					error,
				} );
			}
		);
	};
}

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
