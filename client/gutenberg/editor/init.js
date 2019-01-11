/** @format */
/**
 * External dependencies
 */
import { mapValues, once } from 'lodash';

/**
 * WordPress dependencies
 */
import { use, plugins, dispatch } from '@wordpress/data';
import { unstable__bootstrapServerSideBlockDefinitions } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { requestGutenbergCoreServerBlockSettings } from 'state/data-getters';
import { waitForData } from 'state/data-layer/http-data';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import { applyAPIMiddleware } from './api-middleware';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:gutenberg' );

const loadA8CExtensions = () => {
	// This will also load required TinyMCE plugins via Calypso's TinyMCE component
	require( '../extensions/classic-block/editor' );
};

const addResetToRegistry = registry => {
	if ( typeof window === 'object' && window.app && window.app.isDebug ) {
		window.gutenbergState = () => mapValues( registry.stores, ( { store } ) => store.getState() );
	}

	const stores = [];
	return {
		registerStore( namespace, options ) {
			const store = registry.registerStore( namespace, {
				...options,
				reducer: ( state, action ) => {
					if ( 'GUTENLYPSO_RESET' === action.type && namespace === action.namespace ) {
						debug( `Resetting ${ namespace } store` );
						return options.reducer( undefined, action );
					}
					return options.reducer( state, action );
				},
			} );
			stores.push( store );
			return store;
		},
		reset( namespace ) {
			stores.forEach( store => store.dispatch( { type: 'GUTENLYPSO_RESET', namespace } ) );
		},
		resetCoreResolvers() {
			// @see https://github.com/WordPress/gutenberg/blob/e1092c0d0b75fe53ab57bc6c4cc9e32cb2e74e40/packages/data/src/resolvers-cache-middleware.js#L14-L34
			const resolvers = registry.select( 'core/data' ).getCachedResolvers( 'core' );
			debug( `Resetting core store resolvers: ${ Object.keys( resolvers ).toString() }` );
			Object.entries( resolvers ).forEach( ( [ selectorName, resolversByArgs ] ) => {
				resolversByArgs.forEach( ( value, args ) => {
					registry.dispatch( 'core/data' ).invalidateResolution( 'core', selectorName, args );
				} );
			} );
		},
	};
};

const registerGutenbergBlocks = registerCoreBlocks =>
	waitForData( {
		serverBlockSettings: () => requestGutenbergCoreServerBlockSettings(),
	} ).then( ( { serverBlockSettings } ) => {
		if ( serverBlockSettings.data ) {
			debug( 'Registering core server-defined blocks attributes' );
			unstable__bootstrapServerSideBlockDefinitions( serverBlockSettings.data );
		}
		debug( 'Registering core blocks' );
		registerCoreBlocks();
	} );

// We need to ensure that his function is executed only once to avoid duplicate
// block registration, API middleware application etc.
export const initGutenberg = once( ( userId, store ) => {
	debug( 'Starting Gutenberg editor initialization...' );

	const registry = use( addResetToRegistry );

	debug( 'Registering data plugins' );
	const storageKey = 'WP_DATA_USER_' + userId;
	use( plugins.persistence, { storageKey: storageKey } );
	use( plugins.controls );

	debug( 'Initializing gutenberg/calypso store' );
	require( 'gutenberg/editor/calypso-store' );

	// We need to ensure that core-data is loaded after the data plugins have been registered.
	debug( 'Initializing core-data store' );
	require( '@wordpress/core-data' );

	// Avoid using top level imports for these since they will statically
	// initialize core-data before required plugins are loaded.
	const { registerCoreBlocks } = require( '@wordpress/block-library' );
	const { setFreeformContentHandlerName } = require( '@wordpress/blocks' );

	registerGutenbergBlocks( registerCoreBlocks );

	// Prevent Guided tour from showing when editor loads.
	dispatch( 'core/nux' ).disableTips();

	debug( 'Applying API middleware' );
	// Passing callback here in order to change site slug during site switches.
	// We still want to apply middleware only once though, so that's why this call has been kept in init.
	applyAPIMiddleware( () => getSelectedSiteSlug( store.getState() ) );

	debug( 'Loading A8C editor extensions' );
	loadA8CExtensions();

	debug( 'Registering Calypso Classic Block handler' );
	setFreeformContentHandlerName( 'a8c/classic' );

	// Initialize formatting tools
	require( '@wordpress/format-library' );

	debug( 'Gutenberg editor initialization complete.' );

	return {
		Editor: require( 'gutenberg/editor/main' ).default,
		registry,
	};
} );
