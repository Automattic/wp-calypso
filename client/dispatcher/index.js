/** @format */
var Dispatcher = require( 'flux' ).Dispatcher,
	debug = require( 'debug' )( 'calypso:dispatcher' );

var AppDispatcher = Object.assign( new Dispatcher(), {
	handleViewAction: function( action ) {
		debug( 'Dispatching view action %s: %o', action.type, action );
		this.dispatch( {
			source: 'VIEW_ACTION',
			action: action,
		} );
	},
	handleServerAction: function( action ) {
		debug( 'Dispatching server action %s: %o', action.type, action );
		this.dispatch( {
			source: 'SERVER_ACTION',
			action: action,
		} );
	},
} );

module.exports = AppDispatcher;
