/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import wporg from 'lib/wporg';
import utils from 'lib/plugins/utils';
import CuratedPlugins from 'lib/plugins/wporg-data/curated.json';
import { debounce } from 'lib/impure-lodash';

/**
 * Constants
 */
const debug = debugFactory( 'calypso:wporg-data:actions' );
const _LIST_DEFAULT_SIZE = 24;
const _DEFAULT_FIRST_PAGE = 0;

/**
 *  Local variables;
 */
let _fetchingLists = {};
let _currentSearchTerm = null;
let _lastFetchedPagePerCategory = {};
let _totalPagesPerCategory = {};

const PluginsDataActions = {
	fetchPluginsList: debounce( function( category, page, searchTerm ) {
		// We need to debounce this method to avoid mixing diferent dispatch batches (and get an invariant violation from react)
		// Since the infinite scroll mixin is launching a bunch of fetch requests at the same time, without debounce is too easy
		// to get two of those requests running at (almost) the same time and getting react to freak out.
		_lastFetchedPagePerCategory[ category ] = _lastFetchedPagePerCategory[ category ] || _DEFAULT_FIRST_PAGE;
		page = page || _DEFAULT_FIRST_PAGE;

		if ( category === 'search' && page === _DEFAULT_FIRST_PAGE ) {
			_lastFetchedPagePerCategory[ category ] = _DEFAULT_FIRST_PAGE - 1;
		}

		if ( ! this.canFetchList( category, page, searchTerm ) ) {
			return;
		}
		_fetchingLists[ category ] = true;
		if ( searchTerm ) {
			searchTerm = searchTerm.trim();
			_currentSearchTerm = searchTerm;
		}

		Dispatcher.handleViewAction( {
			type: 'FETCH_WPORG_PLUGINS_LIST',
			action: 'FETCH_WPORG_PLUGINS_LIST',
			page: page,
			category: category,
			searchTerm: searchTerm
		} );

		if ( 'featured' === category ) {
			this.fetchCuratedList();
			return;
		}

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
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_WPORG_PLUGINS_LIST',
					action: 'FETCH_WPORG_PLUGINS_LIST',
					page: page,
					category: category,
					data: data ? utils.normalizePluginsList( data.plugins ) : null,
					error: error
				} );
			}
		} );
	}, 25 ),

	fetchCuratedList: function() {
		debug( 'curated plugin list', CuratedPlugins );
		_fetchingLists.featured = null;
		_lastFetchedPagePerCategory.featured = 1;
		_totalPagesPerCategory.featured = 1;
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_WPORG_PLUGINS_LIST',
			action: 'FETCH_WPORG_PLUGINS_LIST',
			page: 1,
			category: 'featured',
			data: utils.normalizePluginsList( CuratedPlugins ),
			error: null
		} );
	},

	fetchNextCategoryPage: function( category, searchTerm ) {
		let lastPage = _DEFAULT_FIRST_PAGE - 1;
		if ( typeof _lastFetchedPagePerCategory[ category ] !== 'undefined' ) {
			lastPage = _lastFetchedPagePerCategory[ category ];
		}
		if ( ! _totalPagesPerCategory[ category ] || _totalPagesPerCategory[ category ] >= lastPage + 1 ) {
			return this.fetchPluginsList( category, lastPage + 1, searchTerm );
		}
	},

	canFetchList: function( category, page, searchTerm ) {
		if ( searchTerm && _fetchingLists.search ) {
			return false;
		}
		if ( _fetchingLists[ category ] || page <= _lastFetchedPagePerCategory[ category ] ) {
			return false;
		}

		return true;
	},

	reset: function() {
		_fetchingLists = {};
		_lastFetchedPagePerCategory = {};
		_totalPagesPerCategory = {};
	}
};

export default PluginsDataActions;
