/**
 * External dependencies
 */
import config from '../../config';
import page from 'page';

/**
 * Internal dependencies
 */
import detectHistoryNavigation from 'lib/detect-history-navigation';
import initialReducer from 'state/reducer';
import initJetpackCloudRoutes from './routes';
import userFactory from 'lib/user';
import { configureReduxStore, setupMiddlewares, utils } from 'boot/common';
import { createReduxStore } from 'state';
import { getInitialState, persistOnChange } from 'state/initial-state';
import { setupLocale } from 'boot/locale';

/**
 * Style dependencies
 */
import 'assets/stylesheets/jetpack-cloud.scss';

const boot = currentUser => {
	utils();
	getInitialState( initialReducer ).then( initialState => {
		const reduxStore = createReduxStore( initialState, initialReducer );
		persistOnChange( reduxStore );
		setupLocale( currentUser.get(), reduxStore );
		configureReduxStore( currentUser, reduxStore );
		setupMiddlewares( currentUser, reduxStore );
		detectHistoryNavigation.start();
		initJetpackCloudRoutes( '/jetpack-cloud' );
		page.start( { decodeURLComponents: false } );
	} );
};

window.AppBoot = () => {
	if ( ! config.isEnabled( 'jetpack-cloud' ) ) {
		window.location.href = '/';
	} else {
		const user = userFactory();
		user.initialize().then( () => boot( user ) );
	}
};
