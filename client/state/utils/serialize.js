/**
 * Internal dependencies
 */
import { SERIALIZE, DESERIALIZE } from 'calypso/state/action-types';

export function serialize( reducer, state ) {
	return reducer( state, { type: SERIALIZE } );
}

export function deserialize( reducer, persisted ) {
	return reducer( persisted, { type: DESERIALIZE } );
}
