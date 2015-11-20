/**
 * External dependencies
 */
var assign = require( 'lodash/object/assign' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	localStore = require( 'store' ),
	emitter = require( 'lib/mixins/emitter' ),
	PluginsDataActions = require( 'lib/plugins/wporg-data/actions' ),
	config = require( 'config' );

/*
 * Constants
 */
var _CACHE_TIME_TO_LIVE = 10 * 60 * 1000, // 10 minutes
	_STORAGE_NAME = 'CachedPluginData';

var _plugins = {},
	_fetching = {},
	PluginsDataStore;

function update( pluginSlug, plugin ) {
	_fetching[ pluginSlug ] = false;

	if ( plugin instanceof Object ) {
		_plugins[ pluginSlug ] = assign( {}, _plugins[ pluginSlug ], plugin );
		_plugins[ pluginSlug ].wporg = true;
	} else {
		_plugins[ pluginSlug ] = null;
	}

	storePlugin( pluginSlug, _plugins[ pluginSlug ] );
}

function storePlugin( slug, pluginData ) {
	var storedData;
	if ( config.isEnabled( 'manage/plugins/cache' ) ) {
		storedData = localStore.get( _STORAGE_NAME ) || {};
		storedData[ slug ] = {
			data: pluginData,
			fetched: Date.now()
		};
		localStore.set( _STORAGE_NAME, storedData );
	}
}

function getPluginDataFromStorage( slug ) {
	var storedLists;
	if ( config.isEnabled( 'manage/plugins/cache' ) ) {
		storedLists = localStore.get( _STORAGE_NAME );
		return storedLists && storedLists[ slug ];
	}
}

function isCachedListStillValid( storedPluginData ) {
	return ( storedPluginData && ( Date.now() - storedPluginData.fetched < _CACHE_TIME_TO_LIVE ) );
}

PluginsDataStore = {
	get: function( pluginSlug ) {
		var storedPluginData;
		if ( typeof _plugins[ pluginSlug ] === 'undefined' && ! _fetching[ pluginSlug ] ) {
			storedPluginData = getPluginDataFromStorage( pluginSlug );
			_plugins[ pluginSlug ] = storedPluginData && storedPluginData.data;
			if ( ! isCachedListStillValid( storedPluginData ) ) {
				PluginsDataActions.fetchPluginData( pluginSlug );
				_fetching[ pluginSlug ] = true;
			}
		}
		return _plugins[ pluginSlug ];
	},

	isFetching: function( pluginSlug ) {
		return !! _fetching[ pluginSlug ];
	},

	emitChange: function() {
		this.emit( 'change' );
	}
};

PluginsDataStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	switch ( action.type ) {
		case 'RECEIVE_WPORG_PLUGIN_DATA':
			update( action.pluginSlug, action.data );
			PluginsDataStore.emitChange();
			break;
	}
} );

// Add the Store to the emitter so we can emit change events.
emitter( PluginsDataStore );

module.exports = PluginsDataStore;
