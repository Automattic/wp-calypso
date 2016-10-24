/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:wporg-data:actions' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	wporg = require( 'lib/wporg' ),
	debounce = require( 'lodash/debounce' ),
	utils = require( 'lib/plugins/utils' );

/**
 * Constants
 */
var _LIST_DEFAULT_SIZE = 24,
	_DEFAULT_FIRST_PAGE = 0;

/**
 *  Local variables;
 */
var _fetchingLists = {},
	_currentSearchTerm = null,
	_lastFetchedPagePerCategory = {},
	_totalPagesPerCategory = {};

var PluginsDataActions = {
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

	fetchNextCategoryPage: function( category, searchTerm ) {
		var lastPage = _DEFAULT_FIRST_PAGE - 1;
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

module.exports = PluginsDataActions;
