/**
 * External dependencies
 */
import debugFactory from 'debug';
import page from 'page';
import React from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import config from '../../config';
import { registerGenericStore } from '@wordpress/data';
/**
 * Internal dependencies
 */
import { getCurrentUserId } from '../../state/current-user/selectors';
import createStore from './store';
import { setupMiddlewares, configureReduxStore } from './common';
import userFactory from '../../lib/user';
import { Gutenboard } from './gutenboard';
import { setupWpDataDebug } from './devtools';
import { setupLocale } from '../../boot/locale';
import { USER_STORE_KEY } from './constants';

/**
 * Style dependencies
 */
import 'assets/stylesheets/gutenboarding.scss';
import 'components/environment-badge/style.scss';

const debug = debugFactory( 'calypso' );

// Create Redux store
const userStore = createStore();

const genericUserStore = {
	getSelectors() {
		return {
			getCurrentUserId: () => getCurrentUserId( userStore.getState() ),
		};
	},
	getActions() {
		return {};
	},
	subscribe: userStore.subscribe,
};

registerGenericStore( USER_STORE_KEY, genericUserStore );

function boot( currentUser ) {
	debug( "Starting Calypso. Let's do this." );

	configureReduxStore( currentUser, userStore );
	setupMiddlewares( currentUser, userStore );
	setupLocale( currentUser.get(), userStore );

	page( '*', ( context, next ) => {
		context.store = userStore;
		next();
	} );

	page.exit( '*', ( context, next ) => {
		context.store = userStore;
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
			<BrowserRouter basename="gutenboarding">
				<Gutenboard />
			</BrowserRouter>,
			document.getElementById( 'wpcom' )
		);
	}
};
