/**
 * Externap dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import reducer from 'calypso/state/partner-portal/reducer';
import { mergeHandlers } from 'calypso/state/action-watchers/utils';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import licenses from 'calypso/state/partner-portal/licenses/handlers';

const debug = debugFactory( 'partner-portal' );

const handlers = mergeHandlers( licenses );

export default function installActionHandlers() {
	const id = 'partner-portal';
	const added = registerHandlers( id, handlers );
	if ( ! added ) {
		debug( `Failed to add action handlers for "${ id }"` );
	}
}

registerReducer( [ 'partnerPortal' ], reducer );
installActionHandlers();
