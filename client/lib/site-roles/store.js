/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:viewers:store' ),
	clone = require( 'lodash/clone' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	emitter = require( 'lib/mixins/emitter' );

var _fetchingRoles = {},
	_rolesBySite = {};

var RolesStore = {
	isFetching: function( siteId ) {
		return _fetchingRoles[ siteId ];
	},

	getRoles: function( siteId ) {
		if ( ! _rolesBySite[ siteId ] ) {
			return {};
		}

		return _rolesBySite[ siteId ];
	},

	emitChange: function() {
		this.emit( 'change' );
	}
};

function updateRoles( siteId, roles ) {
	_fetchingRoles[ siteId ] = false;

	if ( ! _rolesBySite[ siteId ] ) {
		_rolesBySite[ siteId ] = {};
	}

	roles.forEach( function( role ) {
		_rolesBySite[ siteId ][ role.name ] = clone( role );
	} );
}

RolesStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;
	debug( 'register event Type', action.type, payload );

	switch ( action.type ) {
		case 'FETCHING_ROLES':
			_fetchingRoles[ action.siteId ] = true;
			RolesStore.emitChange();
			break;
		case 'RECEIVE_ROLES':
			_fetchingRoles[ action.siteId ] = false;
			// Don't update roles if there was an error
			if ( ! action.error ) {
				updateRoles( action.siteId, action.data.roles );
			}
			RolesStore.emitChange();
			break;
	}
} );

emitter( RolesStore );

module.exports = RolesStore;
