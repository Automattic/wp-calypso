/**
 * External dependencies
 */
import { getInitialState } from '@automattic/state-utils';

export function serialize( reducer, state ) {
	if ( ! reducer.serialize ) {
		return undefined;
	}

	return reducer.serialize( state );
}

export function deserialize( reducer, persisted ) {
	if ( ! reducer.deserialize ) {
		return getInitialState( reducer );
	}

	return reducer.deserialize( persisted );
}
