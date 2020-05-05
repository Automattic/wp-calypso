/**
 * External dependencies
 */
import { forEach } from 'lodash';

/**
 * Helper class for holding results of state serialization
 * Accumulates the state tree for "root" and any number of custom "storage keys"
 * Each storage key is then saved as a separate record in IndexedDB
 */
export class SerializationResult {
	constructor( results = {} ) {
		this.results = results;
	}

	get() {
		return this.results;
	}

	root() {
		return this.results.root;
	}

	addRootResult( reducerKey, result ) {
		return this.addResult( 'root', reducerKey, result );
	}

	addKeyResult( storageKey, result ) {
		return this.addResult( storageKey, null, result );
	}

	addResult( storageKey, reducerKey, result ) {
		if ( result instanceof SerializationResult ) {
			forEach( result.results, ( resultState, resultKey ) => {
				if ( resultKey === 'root' ) {
					this.addResult( storageKey, reducerKey, resultState );
				} else {
					this.addResult( resultKey, null, resultState );
				}
			} );
		} else if ( reducerKey ) {
			if ( ! this.results[ storageKey ] ) {
				this.results[ storageKey ] = {};
			}
			this.results[ storageKey ][ reducerKey ] = result;
		} else {
			this.results[ storageKey ] = result;
		}
	}
}
