/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { registerStore } from '@wordpress/data';

let cache = {};
let alreadyFetchedOptions = false;

const actions = {
	*publishOptions( options ) {
		yield {
			type: 'IO_PUBLISH_OPTIONS',
			options,
		};
		return {
			type: 'PUBLISH_OPTIONS',
			options,
		};
	},
	updateOptions( options ) {
		return {
			type: 'UPDATE_OPTIONS',
			options,
		};
	},
	fetchOptions() {
		return {
			type: 'IO_FETCH_OPTIONS',
		};
	},
	resetLocalChanges() {
		return {
			type: 'RESET_OPTIONS',
			options: cache,
		};
	},
};

/**
 * Store API
 *
 * Selectors under `wp.data.select( STORE_NAME )`:
 *
 * - getOption( String optionName )
 * - hasLocalChanges()
 *
 * Actions under `wp.data.dispatch( STORE_NAME )`:
 *
 * - updateOptions( Object optionsToUpdate )
 * - publishOptions( Object optionsToUpdate )
 * - resetLocalChanges()
 *
 * @param {string} storeName Name of the store.
 * @param {string} optionsPath REST path used to interact with the options API.
 */
export default ( storeName, optionsPath ) => {
	registerStore( storeName, {
		reducer( state, action ) {
			switch ( action.type ) {
				case 'UPDATE_OPTIONS':
				case 'RESET_OPTIONS':
				case 'PUBLISH_OPTIONS':
					return {
						...state,
						...action.options,
					};
			}

			return state;
		},

		actions,

		selectors: {
			getOption( state, key ) {
				return state ? state[ key ] : undefined;
			},
			hasLocalChanges( state ) {
				return !! state && Object.keys( cache ).some( ( key ) => cache[ key ] !== state[ key ] );
			},
		},

		resolvers: {
			// eslint-disable-next-line no-unused-vars
			*getOption( key ) {
				if ( alreadyFetchedOptions ) {
					return; // do nothing
				}

				let options;
				try {
					alreadyFetchedOptions = true;
					options = yield actions.fetchOptions();
				} catch ( error ) {
					options = {};
				}
				cache = options;
				return {
					type: 'UPDATE_OPTIONS',
					options,
				};
			},
		},

		controls: {
			IO_FETCH_OPTIONS() {
				return apiFetch( { path: optionsPath } );
			},
			IO_PUBLISH_OPTIONS( { options } ) {
				cache = options; // optimistically update the cache
				return apiFetch( {
					path: optionsPath,
					method: 'POST',
					data: {
						...options,
					},
				} );
			},
		},
	} );
};
