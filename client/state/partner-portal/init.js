import debugFactory from 'debug';
import { mergeHandlers } from 'calypso/state/action-watchers/utils';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import licenses from 'calypso/state/partner-portal/licenses/handlers';
import partner from 'calypso/state/partner-portal/partner/handlers';
import reducer from 'calypso/state/partner-portal/reducer';
import { registerReducer } from 'calypso/state/redux-store';

const debug = debugFactory( 'partner-portal' );

const handlers = mergeHandlers( partner, licenses );

export default function installActionHandlers() {
	const id = 'partner-portal';
	const added = registerHandlers( id, handlers );
	if ( ! added ) {
		debug( `Failed to add action handlers for "${ id }"` );
	}
}

registerReducer( [ 'partnerPortal' ], reducer );
installActionHandlers();
