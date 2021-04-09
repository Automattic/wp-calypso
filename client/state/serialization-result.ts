/**
 * External dependencies
 */
import { forEach } from 'lodash';

type Json = any;

/**
 * Helper class for holding results of state serialization
 * Accumulates the state tree for "root" and any number of custom "storage keys"
 * Each storage key is then saved as a separate record in IndexedDB
 */
export class SerializationResult {
	results: Record< string, Json >;
	constructor( results: Record< string, Json > = {} ) {
		this.results = results;
	}

	get(): Record< string, Json > {
		return this.results;
	}

	root(): Json | SerializationResult {
		return this.results.root;
	}

	addRootResult( reducerKey: string, result: Json | SerializationResult ): void {
		return this.addResult( 'root', reducerKey, result );
	}

	addKeyResult( storageKey: string, result: Json | SerializationResult ): void {
		return this.addResult( storageKey, null, result );
	}

	addResult(
		storageKey: string,
		reducerKey: string | null,
		result: Json | SerializationResult
	): void {
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
