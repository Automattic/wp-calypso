/**
 * External dependencies
 */
import { clone } from 'lodash';
import localStore from 'store';

/**
 * Internal dependencies
 */
import PluginsDataActions from './actions';
import config from 'config';
import Dispatcher from 'dispatcher';
import emitter from 'lib/mixins/emitter';

/**
 * Internal dependencies
 */
let PluginsListsStore;

let _shortLists = {},
	_fullLists = {},
	_fetching = {},
	_currentSearchTerm = null,
	_CACHEABLE_CATEGORIES = [ 'featured', 'popular' ],
	_STORAGE_LIST_NAME = 'CachedPluginsLists',
	_DEFAULT_FIRST_PAGE = 1,
	_CACHE_TIME_TO_LIVE = 10 * 60 * 1000; // 10 minutes ;

function appendPage( category, page, list ) {
	_fullLists[ category ] = _fullLists[ category ] || [];
	_fullLists[ category ] = _fullLists[ category ].concat( clone( list ) );
}

function update( category, page, list ) {
	if ( ! page || page === _DEFAULT_FIRST_PAGE ) {
		_shortLists[ category ] = clone( list.slice( 0, 6 ) );
		_fullLists[ category ] = clone( list );
		if ( _CACHEABLE_CATEGORIES.indexOf( category ) >= 0 ) {
			storePluginsList( category, _shortLists[ category ] );
		}
	} else {
		appendPage( category, page, list );
	}
}

function storePluginsList( category, pluginsList ) {
	if ( config.isEnabled( 'manage/plugins/cache' ) ) {
		const storedLists = localStore.get( _STORAGE_LIST_NAME ) || {};
		storedLists[ category ] = {
			list: pluginsList,
			fetched: Date.now()
		};
		localStore.set( _STORAGE_LIST_NAME, storedLists );
	}
}

function getPluginsListFromStorage( category ) {
	if ( config.isEnabled( 'manage/plugins/cache' ) ) {
		const storedLists = localStore.get( _STORAGE_LIST_NAME );
		if ( storedLists && storedLists[ category ] ) {
			return storedLists[ category ];
		}
	}
}

function isCachedListStillValid( storedList ) {
	return ( Date.now() - storedList.fetched < _CACHE_TIME_TO_LIVE );
}

PluginsListsStore = {
	getShortList: function( category ) {
		let storedList;
		if ( ! _shortLists[ category ] && ! _fetching[ category ] ) {
			if ( _CACHEABLE_CATEGORIES.indexOf( category ) >= 0 ) {
				storedList = getPluginsListFromStorage( category );
			}
			if ( storedList && isCachedListStillValid( storedList ) ) {
				_shortLists[ category ] = storedList.list;
			} else {
				PluginsDataActions.fetchPluginsList( category, _DEFAULT_FIRST_PAGE );
			}
			_shortLists[ category ] = storedList ? storedList.list : [];
		}
		return {
			fetching: !! _fetching[ category ],
			list: _shortLists[ category ] || []
		};
	},

	getFullList: function( category ) {
		if ( ! _fullLists[ category ] ) {
			PluginsDataActions.fetchPluginsList( category, _DEFAULT_FIRST_PAGE );
		}
		return {
			fetching: _fetching[ category ] !== false,
			list: _fullLists[ category ] || []
		};
	},

	getSearchList: function( searchTerm ) {
		let isSearching = _fetching.search !== false;
		if ( ! searchTerm ) {
			return;
		}
		searchTerm = searchTerm.trim();

		if ( _currentSearchTerm !== searchTerm ) {
			_fullLists.search = null;
			_currentSearchTerm = searchTerm;
			PluginsDataActions.fetchPluginsList( 'search', 0, searchTerm );
			isSearching = true;
		}
		return {
			fetching: isSearching,
			list: _fullLists.search || []
		};
	},

	emitChange: function() {
		this.emit( 'change' );
	}
};

PluginsListsStore.dispatchToken = Dispatcher.register( function( payload ) {
	const action = payload.action;
	switch ( action.type ) {
		case 'RECEIVE_WPORG_PLUGINS_LIST':
			if ( action.data ) {
				update( action.category, action.page, action.data );
				_fetching[ action.category ] = false;
				PluginsListsStore.emitChange();
			}
			break;
		case 'FETCH_WPORG_PLUGINS_LIST':
			if ( action.category ) {
				_fetching[ action.category ] = true;
				if ( action.category === 'search' ) {
					_currentSearchTerm = action.searchTerm;
					if ( action.page === 0 ) {
						update( 'search', 0, [] );
					}
				}

				PluginsListsStore.emitChange();
			}
			break;
		case 'RESET_WPORG_PLUGINS_LIST':
			_shortLists = {};
			_fullLists = {};
			_fetching = {};
			_currentSearchTerm = null;
			break;
	}
} );

// Add the Store to the emitter so we can emit change events.
emitter( PluginsListsStore );

export default PluginsListsStore;
