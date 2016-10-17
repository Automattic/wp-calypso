/**
 * External dependencies
 */
const debug = require( 'debug' )( 'calypso:wporg-data:actions' );
import debounce from 'lodash/debounce';
/**
 * Internal dependencies
 */
import wporg from 'lib/wporg';
import utils from 'lib/plugins/utils';
import { WPORG_PLUGIN_DATA_RECEIVE, FETCH_WPORG_PLUGIN_DATA, WPORG_PLUGIN_RECEIVE_LIST, WPORG_PLUGIN_FETCH_LIST } from 'state/action-types';

/**
 *  Local variables;
 */
const _fetching = {};
const _LIST_DEFAULT_SIZE = 24;
const _DEFAULT_FIRST_PAGE = 0;
const _fetchingLists = {};
let _currentSearchTerm = null;
const _lastFetchedPagePerCategory = {};
const _totalPagesPerCategory = {};

export default {
	fetchPluginData: function( pluginSlug ) {
		return ( dispatch ) => {
			if ( _fetching[ pluginSlug ] ) {
				return;
			}
			_fetching[ pluginSlug ] = true;

			setTimeout( () => {
				dispatch( {
					type: FETCH_WPORG_PLUGIN_DATA,
					pluginSlug: pluginSlug,
				} );
			}, 1 );

			wporg.fetchPluginInformation( pluginSlug, function( error, data ) {
				_fetching[ pluginSlug ] = null;
				debug( 'plugin details fetched from .org', pluginSlug, error, data );

				dispatch( {
					type: WPORG_PLUGIN_DATA_RECEIVE,
					pluginSlug: pluginSlug,
					data: data ? utils.normalizePluginData( { detailsFetched: Date.now() }, data ) : null,
					error: error
				} );
			} );
		};
	},

	fetchPluginsList: function( category, page, searchTerm ) {
		return debounce( ( dispatch ) => {
			// We need to debounce this method to avoid mixing diferent dispatch batches (and get an invariant violation from react)
			// Since the infinite scroll mixin is launching a bunch of fetch requests at the same time, without debounce is too easy
			// to get two of those requests running at (almost) the same time and getting react to freak out.
			_lastFetchedPagePerCategory[ category ] = _lastFetchedPagePerCategory[ category ] || _DEFAULT_FIRST_PAGE;
			page = page || _DEFAULT_FIRST_PAGE;

			if ( category === 'search' && page === _DEFAULT_FIRST_PAGE ) {
				_lastFetchedPagePerCategory[ category ] = _DEFAULT_FIRST_PAGE - 1;
			}

			_fetchingLists[ category ] = true;
			if ( searchTerm ) {
				searchTerm = searchTerm.trim();
				_currentSearchTerm = searchTerm;
			}
			dispatch( {
				type: WPORG_PLUGIN_FETCH_LIST,
				page: page,
				category: category,
				searchTerm: searchTerm
			} );

			wporg.fetchPluginsList( {
				pageSize: _LIST_DEFAULT_SIZE,
				page: page,
				category: category,
				search: searchTerm
			}, function( error, data ) {
				if ( ! searchTerm || searchTerm === _currentSearchTerm ) {
					debug( 'plugin list fetched from .org', category, error, data );
					_fetchingLists[ category ] = null;
					_lastFetchedPagePerCategory[ category ] = page;
					_totalPagesPerCategory[ category ] = data.info.pages;
					dispatch( {
						type: WPORG_PLUGIN_RECEIVE_LIST,
						page: page,
						category: category,
						data: data ? utils.normalizePluginsList( data.plugins ) : null,
						error: error
					} );
				}
			} );
		}, 500 );
	}
};
