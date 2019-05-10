/**
 * Global polyfills
 */
import 'boot/polyfills';

/**
 * External dependencies
 */
import page from 'page';
/**
 * Internal dependencies
 */
import userFactory from 'lib/user';
import { setCurrentUser } from 'state/current-user/actions';
import createStore from './store';
import initSignupSection from 'signup';

// Create Redux store
const store = createStore();

const userStore = userFactory();
const userInitialized = new Promise( resolve => {
	if ( userStore.initialized ) {
		resolve( userStore.get() );
	} else {
		userStore.once( 'change', () => resolve( userStore.get() ) );
	}
} );

userInitialized.then( user => {
	if ( user ) {
		store.dispatch( setCurrentUser( user ) );
	}

	page( '*', ( context, next ) => {
		context.store = store;
		next();
	} );

	page.exit( '*', ( context, next ) => {
		context.store = store;
		next();
	} );

	initSignupSection( page );
	page.start();
} );
