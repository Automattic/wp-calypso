/**
 * External dependencies
 */

import { clone } from 'lodash';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import emitter from 'lib/mixins/emitter';
import PluginsDataActions from './actions';

let _shortLists = {},
	_fullLists = {},
	_fetching = {},
	_currentSearchTerm = null,
	_DEFAULT_FIRST_PAGE = 1;

function appendPage( category, page, list ) {
	_fullLists[ category ] = _fullLists[ category ] || [];
	_fullLists[ category ] = _fullLists[ category ].concat( clone( list ) );
}

function update( category, page, list ) {
	if ( ! page || page === _DEFAULT_FIRST_PAGE ) {
		_shortLists[ category ] = clone( list.slice( 0, 6 ) );
		_fullLists[ category ] = clone( list );
	} else {
		appendPage( category, page, list );
	}
}

const PluginsListsStore = {
	getShortList: function ( category ) {
		if ( ! _shortLists[ category ] && ! _fetching[ category ] ) {
			PluginsDataActions.fetchPluginsList( category, _DEFAULT_FIRST_PAGE );
		}
		return {
			fetching: !! _fetching[ category ],
			list: _shortLists[ category ] || [],
		};
	},

	getFullList: function ( category ) {
		if ( ! _fullLists[ category ] ) {
			PluginsDataActions.fetchPluginsList( category, _DEFAULT_FIRST_PAGE );
		}
		return {
			fetching: _fetching[ category ] !== false,
			list: _fullLists[ category ] || [],
		};
	},

	getSearchList: function ( searchTerm ) {
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
			list: _fullLists.search || [],
		};
	},

	emitChange: function () {
		this.emit( 'change' );
	},
};

PluginsListsStore.dispatchToken = Dispatcher.register( function ( payload ) {
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
