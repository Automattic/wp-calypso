/** @format */

/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { SUPPORT_SESSION_TRANSITION } from 'state/action-types';

const debug = debugFactory( 'calypso:state:support:actions' );

export const SESSION_NONE = 'none';
export const SESSION_ACTIVE = 'active';
export const SESSION_EXPIRED = 'expired';

export default function supportSession( state = SESSION_NONE, { type, nextState } ) {
	switch ( type ) {
		case SUPPORT_SESSION_TRANSITION:
			if (
				( state === SESSION_NONE && nextState === SESSION_ACTIVE ) ||
				( state === SESSION_ACTIVE && nextState === SESSION_EXPIRED )
			) {
				return nextState;
			}

			debug( `invalid support session transition from '${ state }' to '${ nextState }'` );
			return state;

		default:
			return state;
	}
}
