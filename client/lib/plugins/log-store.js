/**
 * External dependencies
 */

import { clone, findIndex, indexOf, isArray, pullAt } from 'lodash';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:my-sites:plugins:log-store' );

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import emitter from 'lib/mixins/emitter';

let _errors = [],
	_inProgress = [],
	_completed = [],
	LogStore;

function addLog( status, action, site, plugin, error ) {
	const log = {
		status: status,
		action: action,
		site: site,
		plugin: plugin,
	};

	debug( 'add in ' + status + ' data:', log );
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

function clearLog( status ) {
	debug( 'clearing log:', status );
	switch ( status ) {
		case 'error':
			_errors = [];
			break;

		case 'inProgress':
			_inProgress = [];
			break;

		case 'completed':
			_completed = [];
			break;
	}
}

function removeSingleLog( log ) {
	let index;
	debug( 'removing log:', log );
	switch ( log.status ) {
		case 'error':
			index = findIndex( _errors, log );
			pullAt( _errors, index );
			debug( 'current errors:', _errors );
			break;

		case 'inProgress':
			index = findIndex( _inProgress, log );
			pullAt( _inProgress, index );
			debug( 'current in progress:', _inProgress );
			break;

		case 'completed':
			index = findIndex( _completed, log );
			pullAt( _completed, index );
			debug( 'current completed:', _completed );
			break;
	}
}

LogStore = {
	getErrors: function () {
		return clone( _errors );
	},

	getInProgress: function () {
		return clone( _inProgress );
	},

	getCompleted: function () {
		return clone( _completed );
	},

	isInProgressAction: function ( siteId, pluginSlug, action ) {
		const dones = arguments.length;
		return _inProgress.some( function ( log ) {
			let done = 0;
			if ( action && isArray( action ) ) {
				if ( indexOf( action, log.action ) !== -1 ) {
					done++;
				}
			} else if ( action && action === log.action ) {
				done++;
			}

			if ( siteId && siteId === log.site.ID ) {
				done++;
			}

			if ( pluginSlug && pluginSlug === log.plugin.slug ) {
				done++;
			}

			return done === dones;
		} );
	},

	emitChange: function () {
		this.emit( 'change' );
	},
};

LogStore.dispatchToken = Dispatcher.register( function ( payload ) {
	const action = payload.action;

	debug( 'register event Type', action.type, payload );
	switch ( action.type ) {
		case 'REMOVE_PLUGINS_NOTICES':
			action.logs.forEach( clearLog );
			LogStore.emitChange();
			break;
		case 'UPDATE_PLUGIN':
		case 'ACTIVATE_PLUGIN':
		case 'DEACTIVATE_PLUGIN':
		case 'ENABLE_AUTOUPDATE_PLUGIN':
		case 'DISABLE_AUTOUPDATE_PLUGIN':
		case 'INSTALL_PLUGIN':
		case 'REMOVE_PLUGIN':
			addLog( 'inProgress', action.action, action.site, action.plugin );
			LogStore.emitChange();
			break;
		case 'RECEIVE_UPDATED_PLUGIN':
		case 'RECEIVE_ACTIVATED_PLUGIN':
		case 'RECEIVE_DEACTIVATED_PLUGIN':
		case 'RECEIVE_ENABLED_AUTOUPDATE_PLUGIN':
		case 'RECEIVE_DISABLED_AUTOUPDATE_PLUGIN':
		case 'RECEIVE_INSTALLED_PLUGIN':
		case 'RECEIVE_REMOVE_PLUGIN':
			removeSingleLog( {
				status: 'inProgress',
				action: action.action,
				site: action.site,
				plugin: action.plugin,
			} );
			if ( action.type === 'RECEIVE_ACTIVATED_PLUGIN' ) {
				if ( ! ( action.data && action.data.active ) && ! action.error ) {
					action.error = { error: 'broken-plugin' };
				}
			}

			if (
				action.error &&
				[ 'activation_error', 'deactivation_error' ].indexOf( action.error.error ) === -1
			) {
				addLog( 'error', action.action, action.site, action.plugin, action.error );
			} else {
				addLog( 'completed', action.action, action.site, action.plugin );
			}
			LogStore.emitChange();
			break;
		case 'RECEIVE_PLUGINS':
			if ( action.error ) {
				addLog( 'error', action.action, action.site, null, action.error );
				LogStore.emitChange();
			}
			break;
	}
} );

// Add the Store to the emitter so we can emit change events.
emitter( LogStore );

export default LogStore;
