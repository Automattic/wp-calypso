import { MessageProcessor } from '@a2ui/web_core/v0_9';
import { catalog } from './catalog';
import type { ReactComponentImplementation } from '@a2ui/react/v0_9';
import type { A2uiClientAction as A2uiAction, A2uiMessage } from '@a2ui/web_core/v0_9';

export function createA2uiRuntime( {
	onAction,
	onError,
}: {
	onAction: ( action: A2uiAction ) => void | Promise< void >;
	onError: ( error: Error, surfaceId?: string ) => void;
} ) {
	const processor = new MessageProcessor< ReactComponentImplementation >(
		[ catalog ],
		async ( action ) => {
			try {
				await onAction( action );
			} catch ( error ) {
				onError( error instanceof Error ? error : new Error( String( error ) ), action.surfaceId );
			}
		}
	);
	const placements = new Map< string, string >();
	const revisions = new Map< string, number >();
	const listeners = new Set< () => void >();
	let messageId = '';
	const created = processor.onSurfaceCreated( ( surface ) => {
		placements.set( surface.id, messageId );
		surface.onError.subscribe( ( error ) => onError( new Error( error.message ), surface.id ) );
	} );
	const deleted = processor.onSurfaceDeleted( ( surfaceId ) => placements.delete( surfaceId ) );

	return {
		processMessages: ( messages: readonly A2uiMessage[], ownerMessageId: string ) => {
			messageId = ownerMessageId;
			for ( const message of messages ) {
				let surfaceId;
				if ( 'createSurface' in message ) {
					surfaceId = message.createSurface.surfaceId;
				} else if ( 'updateComponents' in message ) {
					surfaceId = message.updateComponents.surfaceId;
				} else if ( 'updateDataModel' in message ) {
					surfaceId = message.updateDataModel.surfaceId;
				} else {
					surfaceId = message.deleteSurface.surfaceId;
				}
				try {
					processor.processMessages( [ message ] );
				} catch ( error ) {
					onError( error instanceof Error ? error : new Error( String( error ) ), surfaceId );
				}
				revisions.set( surfaceId, ( revisions.get( surfaceId ) ?? 0 ) + 1 );
			}
			listeners.forEach( ( listener ) => listener() );
		},
		getSurface: ( id: string ) => processor.getSurface( id ),
		getSurfaceRevision: ( id: string ) => revisions.get( id ) ?? 0,
		getSurfaceIds: ( ownerMessageId: string ) =>
			[ ...placements ].flatMap( ( [ id, owner ] ) => ( owner === ownerMessageId ? [ id ] : [] ) ),
		getMessageMetadata: () => {
			const dataModel = processor.getRendererDataModel( 'v0.9' );
			return dataModel ? { a2uiClientDataModel: dataModel } : undefined;
		},
		subscribe: ( listener: () => void ) => {
			listeners.add( listener );
			return () => {
				listeners.delete( listener );
			};
		},
		dispose: () => {
			listeners.clear();
			revisions.clear();
			created.unsubscribe();
			deleted.unsubscribe();
			processor.model.dispose();
			processor.dispose();
		},
	};
}

export type A2uiRuntime = ReturnType< typeof createA2uiRuntime >;
