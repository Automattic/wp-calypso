/**
 * External dependencies
 */
import debugFactory from 'debug';
import { withStorageKey } from '@automattic/state-utils';

/**
 * Internal dependencies
 */
import { SUPPORT_SESSION_TRANSITION } from 'calypso/state/action-types';
import { SESSION_ACTIVE, SESSION_EXPIRED, SESSION_NONE } from './constants';

const debug = debugFactory( 'calypso:state:support:actions' );

function supportSession( state = SESSION_NONE, { type, nextState } ) {
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

export default withStorageKey( 'support', supportSession );
