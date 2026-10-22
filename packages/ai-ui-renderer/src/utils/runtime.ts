import { MessageProcessor, RELAXED_VALIDATION } from '@a2ui/web_core';
import type { InteractiveUiCatalog } from './catalog';
import type { ReactComponentImplementation } from '@a2ui/react';
import type { A2uiErrorPayload, ActionPayload } from '@a2ui/web_core';
import type { AgentToRendererMessage } from '@a2ui/web_core/v1_0';

export type InteractiveUiMessage = AgentToRendererMessage;

interface InteractiveUiRuntimeOptions {
	/** From `createInteractiveUiCatalog()`. Each surface renders with the one its messages name. */
	catalogs: InteractiveUiCatalog[];
	/** Sends the surfaces' actions to the agent. */
	onAction: ( action: ActionPayload ) => Promise< void >;
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
	// Relaxed validation still rejects cycles and over-deep layouts, which would never finish
	// rendering, even across updates.
	const processor = new MessageProcessor< ReactComponentImplementation >( catalogs, onAction, {
		validationConfig: RELAXED_VALIDATION,
	} );

	const surfaceOwnerIds = new Map< string, string >();
	let currentOwnerId = '';

	// A surface disposes its error subscription along with itself.
	const createdSubscription = processor.onSurfaceCreated( ( surface ) => {
		surfaceOwnerIds.set( surface.id, currentOwnerId );
		surface.onError.subscribe( onError );
	} );

	const deletedSubscription = processor.onSurfaceDeleted( ( id ) => surfaceOwnerIds.delete( id ) );

	return {
		processMessages: ( messages: InteractiveUiMessage[], ownerId: string ) => {
			currentOwnerId = ownerId;
			processor.processMessages( messages );
		},
		getSurface: ( id: string ) => processor.getSurface( id ),
		getSurfaceIds: ( ownerId: string ) =>
			[ ...surfaceOwnerIds ].filter( ( [ , owner ] ) => owner === ownerId ).map( ( [ id ] ) => id ),
		dispose: () => {
			createdSubscription.unsubscribe();
			deletedSubscription.unsubscribe();
			processor.model.dispose();
			processor.dispose();
		},
	};
}

export type InteractiveUiRuntime = ReturnType< typeof createInteractiveUiRuntime >;
