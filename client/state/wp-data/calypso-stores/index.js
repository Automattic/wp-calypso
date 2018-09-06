/**
 * Internal dependencies
 */
import preferences from './preferences';

export function registerStores( registry, calypsoStore ) {
	registry.registerStore( 'calypso/preferences', preferences, calypsoStore );
};
