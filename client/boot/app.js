// Initialize polyfills before any dependencies are loaded
import './polyfills';

if ( process.env.NODE_ENV === 'development' ) {
	require( 'lib/wrap-es6-functions' )();
}

/**
 * External dependencies
 */
import debugFactory from 'debug';
import { invoke } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import {
	configureReduxStore,
	locales,
	setupMiddlewares,
	utils
} from './common';
import createReduxStoreFromPersistedInitialState from 'state/initial-state';
import detectHistoryNavigation from 'lib/detect-history-navigation';
import { getUserFromCache, subscribeToUserChanges } from './user';

const debug = debugFactory( 'calypso' );

const bootProject = ( currentUser, reduxStore ) => {
	debug( "Starting Calypso. Let's do this." );

	configureReduxStore( currentUser, reduxStore );

	const project = require( `./project/${ PROJECT_NAME }` );

	utils();
	invoke( project, 'utils' );

	locales( currentUser, reduxStore );
	invoke( project, 'locales', currentUser, reduxStore );

	invoke( project, 'configureReduxStore', currentUser, reduxStore );

	setupMiddlewares( currentUser, reduxStore );
	invoke( project, 'setupMiddlewares', currentUser, reduxStore );

	detectHistoryNavigation.start();
	page.start( { decodeURLComponents: false } );
};

window.AppBoot = () => {
	createReduxStoreFromPersistedInitialState( reduxStore => {
		bootProject( getUserFromCache( reduxStore ), reduxStore );
		subscribeToUserChanges( reduxStore, currentUser => {
			bootProject( currentUser, reduxStore );
		} );
	} );
};
