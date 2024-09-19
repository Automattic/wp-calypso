import debugFactory from 'debug';
import agencies from 'calypso/state/a8c-for-agencies/agency/handlers';
import reducer from 'calypso/state/a8c-for-agencies/reducer';
import { mergeHandlers } from 'calypso/state/action-watchers/utils';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { registerReducer } from 'calypso/state/redux-store';

const debug = debugFactory( 'a8c-for-agencies' );

const handlers = mergeHandlers( agencies );

export default function installActionHandlers() {
	const id = 'a8c-for-agencies';
	const added = registerHandlers( id, handlers );
	if ( ! added ) {
		debug( `Failed to add action handlers for "${ id }"` );
	}
}

registerReducer( [ 'a8cForAgencies' ], reducer );
installActionHandlers();
