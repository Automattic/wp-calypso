/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { registerStore } from '@wordpress/data';

let cache = {};
let alreadyFetchedOptions = false;

const actions = {
	*updateOptions( options, shouldPostToOptions = true ) {
		if ( shouldPostToOptions ) {
			yield {
				type: 'IO_UPDATE_OPTIONS',
				options,
			};
		}
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
			type: 'UPDATE_OPTIONS',
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
 * - updateOptions( Object optionsToUpdate, boolean shouldPostToAPI )
 * - resetLocalChanges()
 *
 * @param {String} storeName Name of the store.
 * @param {String} optionsPath REST path used to interact with the options API.
 */
export default ( storeName, optionsPath ) => {
	registerStore( storeName, {
		reducer( state, action ) {
			switch ( action.type ) {
				case 'UPDATE_OPTIONS':
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
				return !! state && Object.keys( cache ).some( key => cache[ key ] !== state[ key ] );
			},
		},

		resolvers: {
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
			IO_UPDATE_OPTIONS( { options } ) {
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
