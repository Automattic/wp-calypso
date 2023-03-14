import apiFetch from '@wordpress/api-fetch';
import { register, createReduxStore } from '@wordpress/data';

// Global data passed from PHP.
const { STORE_NAME, REST_PATH } = JETPACK_GLOBAL_STYLES_EDITOR_CONSTANTS; // eslint-disable-line no-undef

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

export const store = createReduxStore( STORE_NAME, {
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
			return apiFetch( { path: REST_PATH } );
		},
		IO_PUBLISH_OPTIONS( { options } ) {
			cache = options; // optimistically update the cache
			return apiFetch( {
				path: REST_PATH,
				method: 'POST',
				data: {
					...options,
				},
			} );
		},
	},
} );

register( store );
