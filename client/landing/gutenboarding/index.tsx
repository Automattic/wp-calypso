/**
 * External dependencies
 */
import debugFactory from 'debug';
import page from 'page';
import React from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import config from '../../config';
import { Provider } from 'react-redux';
/**
 * Internal dependencies
 */
import createStore from './store';
import { setupMiddlewares, configureReduxStore } from './common';
import userFactory from '../../lib/user';
import { Gutenboard } from './gutenboard';
import { setupWpDataDebug } from './devtools';
import { setupLocale } from '../../boot/locale';

/**
 * Style dependencies
 */
import 'assets/stylesheets/gutenboarding.scss';
import 'components/environment-badge/style.scss';

const debug = debugFactory( 'calypso' );

// Create Redux store
const store = createStore();

function boot( currentUser ) {
	debug( "Starting Calypso. Let's do this." );

	configureReduxStore( currentUser, store );
	setupMiddlewares( currentUser, store );
	setupLocale( currentUser.get(), store );

	page( '*', ( context, next ) => {
		context.store = store;
		next();
	} );

	page.exit( '*', ( context, next ) => {
		context.store = store;
		next();
	} );

	page.start( { decodeURLComponents: false } );
}

window.AppBoot = () => {
	if ( ! config.isEnabled( 'gutenboarding' ) ) {
		window.location.href = '/';
	} else {
		const user = userFactory();
		user.initialize().then( () => boot( user ) );

		setupWpDataDebug();

		ReactDom.render(
			<Provider store={ store }>
				<BrowserRouter basename="gutenboarding">
					<Gutenboard />
				</BrowserRouter>
			</Provider>,
			document.getElementById( 'wpcom' )
		);
	}
};
