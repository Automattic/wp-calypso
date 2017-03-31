/**
 * External dependencies
 */
import { reject, filter, clone } from 'lodash';
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import Emitter from 'lib/mixins/emitter';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:sites-list:log-store' );

let _errors = [],
	_inProgress = [],
	_completed = [];

function addLog( status, action, site, error ) {
	const log = {
		status: status,
		action: action,
		site: site
	};

	switch ( status ) {
		case 'error':
			log.error = error;
			_errors.push( log );
			break;

		case 'inProgress':
			_inProgress.push( log );
			debug( 'current in progress:', _inProgress );
			break;

		case 'completed':
			_completed.push( log );
			debug( 'current completed:', _completed );
			break;
	}
}

function removeLog( log ) {
	debug( 'removing log:', log );

	switch ( log.status ) {
		case 'error':
			_errors = reject( _errors, log );
			debug( 'current errors:', _errors );
			break;

		case 'inProgress':
			_inProgress = reject( _inProgress, log );
			debug( 'current in progress:', _inProgress );
			break;

		case 'completed':
			_completed = reject( _completed, log );
			debug( 'current completed:', _completed );
			break;
	}
}

const LogStore = {

	getErrors: function( filterBy ) {
		if ( filterBy ) {
			return filter( _errors, filterBy );
		}
		return clone( _errors );
	},

	getInProgress: function( filterBy ) {
		if ( filterBy ) {
			return filter( _inProgress, filterBy );
		}
		return clone( _inProgress );
	},

	getCompleted: function( filterBy ) {
		if ( filterBy ) {
			return filter( _completed, filterBy );
		}
		return clone( _completed );
	},

	emitChange: function() {
		this.emit( 'change' );
	}
};

LogStore.dispatchToken = Dispatcher.register( function( payload ) {
	const action = payload.action;

	debug( 'register event Type', action.type, payload );
	switch ( action.type ) {
		case 'REMOVE_SITES_NOTICES':
			action.logs.forEach( removeLog );
			LogStore.emitChange();
			break;
		case 'RECEIVE_PLUGINS':
			if ( action.error ) {
				addLog( 'error', action.action, action.site, action.error );
				LogStore.emitChange();
			}
			break;
	}
} );

// Add the Store to the emitter so we can emit change events.
Emitter( LogStore );

module.exports = LogStore;
