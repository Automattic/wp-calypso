import type { MiddlewareAPI, AnyAction, Action, Middleware } from 'redux';

type Handler = ( storeAPI: MiddlewareAPI, action: Action ) => void;

interface AddListenersAction extends Action {
	type: 'LISTENER-MIDDLEWARE/ADD_LISTENERS';
	payload: Record< string, Handler[] >;
}
interface RemoveListenersAction extends Action {
	type: 'LISTENER-MIDDLEWARE/REMOVE_LISTENERS';
	payload: Record< string, Handler[] >;
}
interface ClearListenersAction extends Action {
	type: 'LISTENER-MIDDLEWARE/CLEAR_LISTENERS';
}
type MiddlewareAction = AddListenersAction | RemoveListenersAction | ClearListenersAction;

function createListenerMiddleware(): Middleware {
	const listeners = new Map< string, Set< Handler > >();

	return ( storeAPI: MiddlewareAPI ) =>
		( next: ( action: Action ) => void ) =>
		( anyAction: AnyAction ) => {
			// We only want to notify listeners of actions that are actions.
			if ( typeof anyAction !== 'object' || typeof anyAction.type !== 'string' ) {
				return next( anyAction );
			}

			const action = anyAction as MiddlewareAction;

			switch ( action.type ) {
				case 'LISTENER-MIDDLEWARE/ADD_LISTENERS': {
					for ( const [ type, handlers ] of Object.entries( action.payload ) ) {
						if ( ! listeners.has( type ) ) {
							listeners.set( type, new Set< Handler >() );
						}
						handlers.forEach( ( handler ) => listeners.get( type )!.add( handler ) );
					}
					return;
				}
				case 'LISTENER-MIDDLEWARE/REMOVE_LISTENERS': {
					for ( const [ type, handlers ] of Object.entries( action.payload ) ) {
						if ( ! listeners.has( type ) ) {
							continue;
						}
						handlers.forEach( ( handler ) => listeners.get( type )!.delete( handler ) );
					}
				}
				case 'LISTENER-MIDDLEWARE/CLEAR_LISTENERS': {
					listeners.clear();
					return next( action );
				}
				default: {
					const otherAction = action as Action;

					if ( ! listeners.has( otherAction.type ) ) {
						return next( otherAction );
					}

					listeners.get( otherAction.type )!.forEach( ( handler ) => handler( storeAPI, action ) );
					return next( otherAction );
				}
			}
		};
}

function addListeners( handlers: Record< string, Handler[] > ): AddListenersAction {
	return {
		type: 'LISTENER-MIDDLEWARE/ADD_LISTENERS',
		payload: handlers,
	};
}

function removeListeners( handlers: Record< string, Handler[] > ): RemoveListenersAction {
	return {
		type: 'LISTENER-MIDDLEWARE/REMOVE_LISTENERS',
		payload: handlers,
	};
}

function clearListeners(): ClearListenersAction {
	return {
		type: 'LISTENER-MIDDLEWARE/CLEAR_LISTENERS',
	};
}

export { createListenerMiddleware, addListeners, removeListeners, clearListeners };
