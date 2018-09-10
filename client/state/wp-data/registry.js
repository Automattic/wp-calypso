/** @format */
/**
 * External dependencies
 */
import { createRegistry } from '@wordpress/data';

/**
 * Internal dependencies
 */
import internalsPlugin from './plugins/internals-plugin';
import customStorePlugin from './plugins/custom-store-plugin';
import combinedStorePlugin from './plugins/combined-store-plugin';
import { reducers } from 'state';

console.log( 'creating registry' );
const registry = createRegistry()
	.use( internalsPlugin )
	.use( customStorePlugin )
	.use( combinedStorePlugin );

let lastCalypsoStore = null;

export function updateCalypsoStore( calypsoStore ) {
	if ( calypsoStore !== lastCalypsoStore ) {
		lastCalypsoStore = calypsoStore;
		registry.registerParentStore( 'calypso', { reducers }, calypsoStore );
	}
}

export default registry;
