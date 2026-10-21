import { MessageProcessor } from '@a2ui/web_core/v0_9';
import type { InteractiveUiCatalog } from './catalog';
import type { ReactComponentImplementation } from '@a2ui/react/v0_9';
import type { A2uiClientAction, A2uiMessage } from '@a2ui/web_core/v0_9';

interface InteractiveUiRuntimeOptions {
	/** From `createInteractiveUiCatalog()`. */
	catalog: InteractiveUiCatalog;
	/** Sends the surfaces' actions to the agent. */
	onAction: ( action: A2uiClientAction ) => Promise< void >;
}

/**
 * Turns A2UI messages into surfaces, grouped by the owner the host shows them next to,
 * such as a chat message.
 */
export function createInteractiveUiRuntime( { catalog, onAction }: InteractiveUiRuntimeOptions ) {
	const processor = new MessageProcessor< ReactComponentImplementation >( [ catalog ], onAction );

	const surfaceOwners = new Map< string, string >();
	let currentOwnerId = '';
	const createdSubscription = processor.onSurfaceCreated( ( surface ) =>
		surfaceOwners.set( surface.id, currentOwnerId )
	);
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
