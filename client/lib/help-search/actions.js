/**
 * External dependencies
 */
import debugFactory from 'debug';

const debug = debugFactory('calypso:help-search:actions');

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';

import { action as ActionTypes } from './constants';
import wpcom from 'lib/wp';

var HelpSearchActions = {
	fetch: function( searchQuery ) {
		debug( 'fetching help links' );

		wpcom.undocumented().getHelpLinks( searchQuery, function( error, helpLinks ) {
			if ( error ) {
				debug( error );
				return;
			}

			debug( 'received help links from API' );

			Dispatcher.handleServerAction( {
				type: ActionTypes.SET_HELP_LINKS,
				helpLinks: helpLinks
			} );
		} );
	}
};

module.exports = HelpSearchActions;
