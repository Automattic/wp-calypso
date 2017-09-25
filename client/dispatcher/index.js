/**
 * External dependencies
 */
import debugFactory from 'debug';
import { Dispatcher } from 'flux';
const debug = debugFactory( 'calypso:dispatcher' );

const AppDispatcher = Object.assign( new Dispatcher(), {
	handleViewAction: function( action ) {
		debug( 'Dispatching view action %s: %o', action.type, action );
		this.dispatch( {
			source: 'VIEW_ACTION',
			action: action
		} );
	},
	handleServerAction: function( action ) {
		debug( 'Dispatching server action %s: %o', action.type, action );
		this.dispatch( {
			source: 'SERVER_ACTION',
			action: action
		} );
	}
} );

export default AppDispatcher;
