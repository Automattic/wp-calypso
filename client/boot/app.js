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
import { subscribeToUserChanges, syncUserWithLegacyStore } from './user';
import { getCurrentUser } from 'state/current-user/selectors';
import { requestUser } from 'state/users/actions';

const debug = debugFactory( 'calypso' );

const bootProject = reduxStore => {
	debug( "Starting Calypso. Let's do this." );

	const project = require( `./project/${ PROJECT_NAME }` );

	configureReduxStore( reduxStore );
	invoke( project, 'configureReduxStore', reduxStore );

	locales( reduxStore );
	invoke( project, 'locales', reduxStore );

	utils();
	invoke( project, 'utils' );

	setupMiddlewares( reduxStore );
	invoke( project, 'setupMiddlewares', reduxStore );

	detectHistoryNavigation.start();
	page.start( { decodeURLComponents: false } );
};

window.AppBoot = () => {
	createReduxStoreFromPersistedInitialState( reduxStore => {
		syncUserWithLegacyStore( reduxStore );
		const userData = getCurrentUser( reduxStore.getState() );
		if ( userData ) {
			bootProject( reduxStore );
		} else {
			reduxStore.dispatch( requestUser() ).catch( () => {
				// boot the project anyway if the user request fails so we display an offline page or redirect to log-in
				bootProject( reduxStore );
			} );
			// reboot if user changes
			subscribeToUserChanges( reduxStore, () => {
				bootProject( reduxStore );
			} );
		}
	} );
};
