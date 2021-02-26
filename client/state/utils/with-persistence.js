/**
 * Internal dependencies
 */
import { DESERIALIZE, SERIALIZE } from 'calypso/state/action-types';

export const withPersistence = ( reducer, { serialize, deserialize } = {} ) => {
	const wrappedReducer = ( state, action ) => {
		switch ( action.type ) {
			case SERIALIZE:
				return serialize ? serialize( state ) : reducer( state, action );
			case DESERIALIZE:
				return deserialize ? deserialize( state ) : reducer( state, action );
			default:
				return reducer( state, action );
		}
	};

	wrappedReducer.hasCustomPersistence = true;

	return wrappedReducer;
};
