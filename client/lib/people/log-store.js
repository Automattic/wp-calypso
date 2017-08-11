/**
 * External dependencies
 */
import { clone, find, reject } from 'lodash';
var debug = require( 'debug' )( 'calypso:my-sites:people:log-store' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	emitter = require( 'lib/mixins/emitter' );

var _errors = [],
	_inProgress = [],
	_completed = [],
	PeopleLogStore;

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

function addLog( status, action, siteId, user, error ) {
	var log = {
		status: status,
		action: action,
		siteId: siteId,
		user: user,
		error: error
	};

	debug( 'Add in ' + status + ' data:', log );
	getList( status ).push( log );
}

function getList( listName ) {
	switch ( listName ) {
		case 'error':
			return _errors;
		case 'inProgress':
			return _inProgress;
		case 'completed':
			return _completed;
	}
}

function filterList( listName, filterBy ) {
	var list = getList( listName );
	if ( filterBy ) {
		list = list.filter( filterBy );
	}
	return clone( list );
}

PeopleLogStore = {
	hasUnauthorizedError: function( siteId ) {
		return Boolean( find( _errors, log => log.siteId === siteId && log.error === 'unauthorized' ) );
	},

	getErrors: filterList.bind( this, 'error' ),

	getInProgress: filterList.bind( this, 'inProgress' ),

	getCompleted: filterList.bind( this, 'completed' ),

	clear: function() {
		_errors = [];
		_inProgress = [];
		_completed = [];
	},

	emitChange: function() {
		this.emit( 'change' );
	}
};

PeopleLogStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	switch ( action.type ) {
		case 'REMOVE_PEOPLE_NOTICES':
			action.logs.forEach( removeLog );
			PeopleLogStore.emitChange();
			break;
		case 'RECEIVE_VIEWERS':
		case 'RECEIVE_USERS':
		case 'RECEIVE_FOLLOWERS':
		case 'RECEIVE_EMAIL_FOLLOWERS':
		case 'RECEIVE_ROLES':
			if ( action.error ) {
				addLog( 'error', action.type, action.siteId || action.fetchOptions.siteId, null, action.error.error );
				PeopleLogStore.emitChange();
			}
			break;
		case 'RECEIVE_USER_FAILED':
			addLog( 'error', action.type, action.fetchOptions.siteId, action.login, action.error.error );
			PeopleLogStore.emitChange();
			break;
		case 'UPDATE_SITE_USER':
		case 'DELETE_SITE_USER':
			addLog( 'inProgress', action.type, action.siteId, action.user );
			PeopleLogStore.emitChange();
			break;
		case 'RECEIVE_DELETE_SITE_USER_FAILURE':
		case 'RECEIVE_DELETE_SITE_USER_SUCCESS':
		case 'RECEIVE_UPDATE_SITE_USER_FAILURE':
		case 'RECEIVE_UPDATE_SITE_USER_SUCCESS':
			removeLog( {
				status: 'inProgress',
				action: action.action,
				siteId: action.siteId,
				user: action.user
			} );
			if ( action.error ) {
				addLog( 'error', action.type, action.siteId, action.user, action.error );
			} else {
				addLog( 'completed', action.type, action.siteId, action.user );
			}
			PeopleLogStore.emitChange();
			break;

	}
} );

// Add the Store to the emitter so we can emit change events.
emitter( PeopleLogStore );

module.exports = PeopleLogStore;
