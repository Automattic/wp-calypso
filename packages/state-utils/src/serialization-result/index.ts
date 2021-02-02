/**
 * External dependencies
 */
import { forEach } from 'lodash';

/**
 * Helper class for holding results of state serialization
 * Accumulates the state tree for "root" and any number of custom "storage keys"
 * Each storage key is then saved as a separate record in IndexedDB
 */
export class SerializationResult< TResult > {
	results: { [ storageKey: string ]: TResult | { [ reducerKey: string ]: TResult } };

	constructor( results: { [ storageKey: string ]: TResult } = {} ) {
		this.results = results;
	}

	get(): SerializationResult< TResult >[ 'results' ] {
		return this.results;
	}

	root(): TResult {
		return this.results.root as TResult;
	}

	addRootResult( reducerKey: string, result: TResult ): void {
		this.addResult( 'root', reducerKey, result );
	}

	addKeyResult( storageKey: string, result: TResult ): void {
		this.addResult( storageKey, null, result );
	}

	addResult( storageKey: string, reducerKey: string | null, result: TResult ): void {
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
				this.results[ storageKey ] = {} as TResult;
			}
			( this.results[ storageKey ] as { [ reducerKey: string ]: TResult } )[ reducerKey ] = result;
		} else {
			this.results[ storageKey ] = result;
		}
	}
}
