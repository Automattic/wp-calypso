/**
 * Global polyfills
 */
import 'boot/polyfills';

/**
 * External dependencies
 */
import debugFactory from 'debug';
import page from 'page';

/**
 * Internal dependencies
 */
import createStore from './store';
import { setupMiddlewares, configureReduxStore } from './common';
import initReaderSections from 'reader';
import initReaderConversationsSection from 'reader/conversations';
import initReaderDiscoverSection from 'reader/discover';
import initReaderFollowingSection from 'reader/following';
import initReaderFullPostSection from 'reader/full-post';
import initReaderLikedStreamSection from 'reader/liked-stream';
import initReaderListSection from 'reader/list';
import initReaderSearchSection from 'reader/search';
import initReaderTagStreamSection from 'reader/tag-stream';
import userFactory from 'lib/user';
import { setupLocale } from 'boot/locale';
import { setStore } from 'state/redux-store';

const debug = debugFactory( 'calypso' );

import 'assets/stylesheets/style.scss';
// goofy import for environment badge, which is SSR'd
import 'components/environment-badge/style.scss';

// Create Redux store
const store = createStore();
setStore( store );

const boot = currentUser => {
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

	initReaderSections();
	initReaderConversationsSection();
	initReaderDiscoverSection();
	initReaderFollowingSection();
	initReaderFullPostSection();
	initReaderLikedStreamSection();
	initReaderListSection();
	initReaderSearchSection();
	initReaderTagStreamSection();

	page.start( { decodeURLComponents: false } );
};

window.AppBoot = () => {
	const user = userFactory();
	user.initialize().then( () => boot( user ) );
};
