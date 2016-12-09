/**
 * External dependencies
 */
import { noop, throttle } from 'lodash';

/**
 * Internal dependencies
 */
import { getState, setState } from './worker';

const DEFAULT_OPTIONS = {
	types: {
		SERIALIZE: 'SERIALIZE',
		DESERIALIZE: 'DESERIALIZE',
		STATE_REPLACE: 'STATE_REPLACE'
	},
	throttle: 500,
	maxAge: 604800000
};

const DESERIALIZE_INIT = '@@DESERIALIZE_INIT';

export default function statePersistenceEnhancer( options ) {
	options = { ...DEFAULT_OPTIONS, options };

	return ( createStore ) => ( baseReducer, initialState, enhancer ) => {
		const { SERIALIZE, DESERIALIZE, STATE_REPLACE } = options.types;
		function reducer( state, action ) {
			if ( STATE_REPLACE === action.type ) {
				return action.state;
			}

			return baseReducer( state, action );
		}

		const store = createStore( reducer, initialState, enhancer );
		let initialized = false;
		const queue = [];

		const { dispatch: baseDispatch } = store;
		function dispatch( action ) {
			if ( initialized ) {
				return baseDispatch( action );
			}

			queue.push( action );
		}

		getState().catch( noop ).then( ( persistedState ) => {
			initialized = true;

			if ( persistedState && persistedState._timestamp + options.maxAge > Date.now() ) {
				let state = baseReducer( persistedState.state, { type: DESERIALIZE } );
				state = baseReducer( state, { type: DESERIALIZE_INIT } );
				store.dispatch( { type: STATE_REPLACE, state } );
			}

			store.replaceReducer( baseReducer );
			queue.forEach( dispatch );
		} );

		let state;
		store.subscribe( throttle( () => {
			if ( ! initialized ) {
				return;
			}

			const nextState = store.getState();
			if ( state && nextState === state ) {
				return;
			}

			state = nextState;

			setState( {
				_timestamp: Date.now(),
				state: reducer( state, { type: SERIALIZE } )
			} ).catch( noop );
		}, options.throttle, { leading: false, trailing: true } ) );

		return {
			...store,
			dispatch
		};
	};
}
