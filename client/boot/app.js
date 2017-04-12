// Initialize localStorage polyfill before any dependencies are loaded
require( 'lib/local-storage' )();
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
import userFactory from 'lib/user';

const debug = debugFactory( 'calypso' );

const boot = currentUser => {
	debug( "Starting Calypso. Let's do this." );

	const project = require( `./project/${ PROJECT_NAME }` );

	locales( currentUser );
	invoke( project, 'locales', currentUser );
	utils();
	invoke( project, 'utils' );
	createReduxStoreFromPersistedInitialState( reduxStore => {
		configureReduxStore( currentUser, reduxStore );
		invoke( project, 'configureReduxStore', currentUser, reduxStore );
		setupMiddlewares( currentUser, reduxStore );
		invoke( project, 'setupMiddlewares', currentUser, reduxStore );
		detectHistoryNavigation.start();
		page.start();
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
