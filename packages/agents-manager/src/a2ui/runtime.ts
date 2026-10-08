import { MessageProcessor } from '@a2ui/web_core/v0_9';
import { catalog } from './catalog';
import type { ReactComponentImplementation } from '@a2ui/react/v0_9';
import type { A2uiClientAction, A2uiMessage } from '@a2ui/web_core/v0_9';

export function createA2uiRuntime( onAction: ( action: A2uiClientAction ) => Promise< void > ) {
	const processor = new MessageProcessor< ReactComponentImplementation >( [ catalog ], onAction );
	const placements = new Map< string, string >();
	let messageId = '';
	const created = processor.onSurfaceCreated( ( surface ) =>
		placements.set( surface.id, messageId )
	);
	const deleted = processor.onSurfaceDeleted( ( id ) => placements.delete( id ) );

	return {
		processMessages: ( messages: A2uiMessage[], ownerMessageId: string ) => {
			messageId = ownerMessageId;
			processor.processMessages( messages );
		},
		getSurface: ( id: string ) => processor.getSurface( id ),
		getSurfaceIds: ( ownerMessageId: string ) =>
			[ ...placements ].flatMap( ( [ id, owner ] ) => ( owner === ownerMessageId ? [ id ] : [] ) ),
		dispose: () => {
			created.unsubscribe();
			deleted.unsubscribe();
			processor.model.dispose();
			processor.dispose();
		},
	};
}

export type A2uiRuntime = ReturnType< typeof createA2uiRuntime >;
