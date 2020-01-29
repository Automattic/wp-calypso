/**
 * External dependencies
 */
import config from '../../config';
import page from 'page';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { configureReduxStore, setupMiddlewares, utils } from 'boot/common';
import initJetpackCloudRoutes from './routes';
import userFactory from 'lib/user';
import { createReduxStore } from 'state';
import initialReducer from 'state/reducer';
import { setupLocale } from 'boot/locale';
import detectHistoryNavigation from 'lib/detect-history-navigation';
import { getInitialState, persistOnChange } from 'state/initial-state';

/**
 * Style dependencies
 */
import 'components/environment-badge/style.scss';
import 'layout/style.scss';
import 'assets/stylesheets/jetpack-cloud.scss';

const debug = debugFactory( 'jetpack-cloud' );

const boot = currentUser => {
	debug( "Starting Jetpack Cloud. Let's do this." );
	utils();
	getInitialState( initialReducer ).then( initialState => {
		const reduxStore = createReduxStore( initialState, initialReducer );
		initJetpackCloudRoutes();
		persistOnChange( reduxStore );
		setupLocale( currentUser.get(), reduxStore );
		configureReduxStore( currentUser, reduxStore );
		setupMiddlewares( currentUser, reduxStore );
		detectHistoryNavigation.start();

		page.start( { decodeURLComponents: false } );
	} );
};

window.AppBoot = () => {
	if ( ! config.isEnabled( 'jetpack-cloud' ) ) {
		window.location.href = '/';
	} else {
		debug( 'before userFactory' );
		const user = userFactory();
		debug( 'after userFactory' );
		user.initialize().then( () => boot( user ) );
	}
};
