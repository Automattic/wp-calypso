/** @format */
/**
 * External dependencies
 */
import { mapValues, once } from 'lodash';

/**
 * WordPress dependencies
 */
import { use, plugins, dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { getSelectedSiteSlug } from 'state/ui/selectors';
import { applyAPIMiddleware } from './api-middleware';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:gutenberg' );

// List of Core blocks that can't be enabled on WP.com (e.g for security reasons).
// We'll have to provide A8C custom versions of these blocks.
const WPCOM_UNSUPPORTED_CORE_BLOCKS = [
	'core/file', // see D19851 for more details.
];

const loadA8CExtensions = () => {
	// This will also load required TinyMCE plugins via Calypso's TinyMCE component
	require( '../extensions/classic-block/editor' );
};

const addResetToRegistry = registry => {
	if ( typeof window === 'object' && window.app && window.app.isDebug ) {
		window.gutenbergState = () => mapValues( registry.stores, ( { store } ) => store.getState() );
	}

	const resettableStores = [ 'core/editor', 'core/notices' ];

	const stores = [];
	return {
		registerStore( namespace, options ) {
			let store;
			if ( -1 === resettableStores.indexOf( namespace ) ) {
				store = registry.registerStore( namespace, options );
			} else {
				store = registry.registerStore( namespace, {
					...options,
					reducer: ( state, action ) =>
						options.reducer( 'GUTENLYPSO_RESET' === action.type ? undefined : state, action ),
				} );
			}
			stores.push( store );
			return store;
		},
		reset() {
			stores.forEach( store => store.dispatch( { type: 'GUTENLYPSO_RESET' } ) );
		},
	};
};

// We need to ensure that his function is executed only once to avoid duplicate
// block registration, API middleware application etc.
export const initGutenberg = once( ( userId, store ) => {
	debug( 'Starting Gutenberg editor initialization...' );

	debug( 'Registering data plugins' );
	const storageKey = 'WP_DATA_USER_' + userId;
	use( plugins.persistence, { storageKey: storageKey } );
	use( plugins.controls );

	const registry = use( addResetToRegistry );

	// We need to ensure that core-data is loaded after the data plugins have been registered.
	debug( 'Initializing core-data store' );
	require( '@wordpress/core-data' );

	// Avoid using top level imports for this since they will statically
	// initialize core-data before required plugins are loaded.
	const { registerCoreBlocks } = require( '@wordpress/block-library' );
	const { unregisterBlockType, setFreeformContentHandlerName } = require( '@wordpress/blocks' );

	debug( 'Registering core blocks' );
	registerCoreBlocks();

	debug( 'Removing core blocks that are not yet supported in Calypso' );
	WPCOM_UNSUPPORTED_CORE_BLOCKS.forEach( blockName => unregisterBlockType( blockName ) );

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
