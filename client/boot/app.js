/** @format */
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
import { configureReduxStore, locales, setupMiddlewares, utils } from './common';
import createReduxStoreFromPersistedInitialState from 'client/state/initial-state';
import detectHistoryNavigation from 'client/lib/detect-history-navigation';
import userFactory from 'client/lib/user';

const debug = debugFactory( 'calypso' );

const boot = currentUser => {
	debug( "Starting Calypso. Let's do this." );

	const project = require( `./project/${ PROJECT_NAME }` );
	utils();
	invoke( project, 'utils' );
	createReduxStoreFromPersistedInitialState( reduxStore => {
		locales( currentUser, reduxStore );
		invoke( project, 'locales', currentUser, reduxStore );
		configureReduxStore( currentUser, reduxStore );
		invoke( project, 'configureReduxStore', currentUser, reduxStore );
		setupMiddlewares( currentUser, reduxStore );
		invoke( project, 'setupMiddlewares', currentUser, reduxStore );
		detectHistoryNavigation.start();
		page.start( { decodeURLComponents: false } );
	} );
};

window.AppBoot = () => {
	const user = userFactory();
	if ( user.initialized ) {
		boot( user );
	} else {
		user.once( 'change', () => boot( user ) );
	}
};
