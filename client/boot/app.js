// Initialize localStorage polyfill before any dependencies are loaded
require( 'lib/local-storage' )();
if ( process.env.NODE_ENV === 'development' ) {
	require( 'lib/wrap-es6-functions' )();
}

/**
 * External dependencies
 */
import * as common from './common';
import debugFactory from 'debug';
import page from 'page';

/**
 * Internal dependencies
 */
import createReduxStoreFromPersistedInitialState from 'state/initial-state';
import detectHistoryNavigation from 'lib/detect-history-navigation';
import userFactory from 'lib/user';

const debug = debugFactory( 'calypso' );

const withProject = () => {
	// TODO: make project name dynamic based on config
	const project = require( './project/wordpress-com' );

	return ( funcName, ...params ) => {
		common[ funcName ]( ...params );
		if ( project[ funcName ] !== undefined ) {
			project[ funcName ]( ...params );
		}
	};
};

const boot = currentUser => {
	debug( "Starting Calypso. Let's do this." );

	const callWithProject = withProject();

	callWithProject( 'locales', currentUser );
	callWithProject( 'utils' );
	createReduxStoreFromPersistedInitialState( reduxStore => {
		callWithProject( 'configureReduxStore', currentUser, reduxStore );
		callWithProject( 'setupMiddlewares', currentUser, reduxStore );
		// We need to require sections to load React with i18n mixin
		require( 'sections' ).load();

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
