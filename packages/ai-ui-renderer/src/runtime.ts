import { MessageProcessor } from '@a2ui/web_core/v0_9';
import type { InteractiveUiCatalog } from './catalog';
import type { ReactComponentImplementation } from '@a2ui/react/v0_9';
import type { A2uiClientAction, A2uiErrorPayload, A2uiMessage } from '@a2ui/web_core/v0_9';

interface InteractiveUiRuntimeOptions {
	/** From `createInteractiveUiCatalog()`. Each surface renders with the one its messages name. */
	catalogs: InteractiveUiCatalog[];
	/** Sends the surfaces' actions to the agent. */
	onAction: ( action: A2uiClientAction ) => Promise< void >;
	/** Reports a surface's errors, such as a function that failed when a button called it. */
	onError: ( error: A2uiErrorPayload ) => void;
}

/**
 * Turns A2UI messages into surfaces, grouped by the owner the host shows them next to,
 * such as a chat message.
 */
export function createInteractiveUiRuntime( {
	catalogs,
	onAction,
	onError,
}: InteractiveUiRuntimeOptions ) {
	const processor = new MessageProcessor< ReactComponentImplementation >( catalogs, onAction );

	const surfaceOwners = new Map< string, string >();
	let currentOwnerId = '';
	// A surface disposes its error subscription along with itself.
	const createdSubscription = processor.onSurfaceCreated( ( surface ) => {
		surfaceOwners.set( surface.id, currentOwnerId );
		surface.onError.subscribe( onError );
	} );
	const deletedSubscription = processor.onSurfaceDeleted( ( id ) => surfaceOwners.delete( id ) );

	return {
		processMessages: ( messages: A2uiMessage[], ownerId: string ) => {
			currentOwnerId = ownerId;
			processor.processMessages( messages );
		},
		getSurface: ( id: string ) => processor.getSurface( id ),
		getSurfaceIds: ( ownerId: string ) =>
			[ ...surfaceOwners ].filter( ( [ , owner ] ) => owner === ownerId ).map( ( [ id ] ) => id ),
		dispose: () => {
			createdSubscription.unsubscribe();
			deletedSubscription.unsubscribe();
			processor.model.dispose();
			processor.dispose();
		},
	};
}

export type InteractiveUiRuntime = ReturnType< typeof createInteractiveUiRuntime >;
