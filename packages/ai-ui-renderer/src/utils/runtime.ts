import { A2uiError, DataModel, MessageProcessor, RELAXED_VALIDATION } from '@a2ui/web_core';
import { getInteractiveUiOperation } from './operation';
import type { InteractiveUiCatalog } from './catalog';
import type { ReactComponentImplementation } from '@a2ui/react';
import type { A2uiErrorPayload, ActionPayload, SurfaceModel } from '@a2ui/web_core';
import type { AgentToRendererMessage } from '@a2ui/web_core/v1_0';

export type InteractiveUiMessage = AgentToRendererMessage;

/** A2UI's renderer data model, which a host sends the agent as `a2uiRendererDataModel` metadata. */
export interface InteractiveUiDataModel {
	version: 'v1.0';
	/** Each surface's data model, by its ID. */
	surfaces: Record< string, Record< string, unknown > >;
}

interface InteractiveUiRuntimeBaseOptions {
	/** From `createInteractiveUiCatalog()`. Each surface renders with the one its messages name. */
	catalogs: InteractiveUiCatalog[];
	/**
	 * Reports each error with the owner of its batch or surface, and the surface's ID when known:
	 * a message the runtime rejects, or a surface's own error, such as a component its catalog
	 * lacks, a render failure or a failed function call.
	 */
	onError: ( error: A2uiErrorPayload, ownerId: string ) => void;
}

export interface InteractiveUiToolCall {
	name: string;
	arguments: Record< string, unknown >;
}

export type InteractiveUiRuntimeOptions = InteractiveUiRuntimeBaseOptions &
	(
		| {
				actionMode?: 'agent';
				/** Sends actions to the agent; the host controls message visibility. */
				onAction: ( action: ActionPayload ) => Promise< void >;
				onToolCall?: never;
		  }
		| {
				actionMode: 'tool-call';
				/** Executes the tool, handles its result, and throws if execution fails. */
				onToolCall: ( call: InteractiveUiToolCall ) => Promise< void >;
				onAction?: never;
		  }
	);

/**
 * The data model paths a surface's obscured TextFields bind to, or `undefined` when one binds a
 * relative path, which a List template resolves per item, so it can't be left out.
 */
function getObscuredPaths( surface: SurfaceModel< ReactComponentImplementation > ) {
	const paths: string[] = [];

	for ( const { type, properties } of surface.componentsModel.values ) {
		const path: unknown = properties.value?.[ '@path' ];

		if ( type !== 'TextField' || properties.variant !== 'obscured' || typeof path !== 'string' ) {
			continue;
		}

		if ( ! path.startsWith( '/' ) ) {
			return undefined;
		}

		paths.push( path );
	}

	return paths;
}

/**
 * Turns A2UI messages into surfaces, grouped by the owner the host shows them next to,
 * such as a chat message.
 */
export function createInteractiveUiRuntime( options: InteractiveUiRuntimeOptions ) {
	const { catalogs, onError } = options;
	const surfaceOwnerIds = new Map< string, string >();
	let currentOwnerId = '';

	// Relaxed validation still rejects cycles and over-deep layouts, which would never finish
	// rendering, even across updates.
	const processor = new MessageProcessor< ReactComponentImplementation >(
		catalogs,
		async ( action ) => {
			if ( options.actionMode !== 'tool-call' ) {
				await options.onAction( action );
				return;
			}

			const ownerId = surfaceOwnerIds.get( action.surfaceId ) ?? '';

			try {
				await options.onToolCall( { name: action.name, arguments: action.context } );
			} catch ( error ) {
				onError(
					{
						code: 'TOOL_CALL_FAILED',
						message: error instanceof Error ? error.message : String( error ),
						surfaceId: action.surfaceId,
						expression: action.name,
					},
					ownerId
				);
			}
		},
		{ validationConfig: RELAXED_VALIDATION }
	);

	// A surface disposes its error subscription along with itself.
	const createdSubscription = processor.onSurfaceCreated( ( surface ) => {
		const ownerId = currentOwnerId;

		surfaceOwnerIds.set( surface.id, ownerId );
		surface.onError.subscribe( ( error ) => onError( error, ownerId ) );
	} );

	const deletedSubscription = processor.onSurfaceDeleted( ( id ) => surfaceOwnerIds.delete( id ) );

	return {
		/**
		 * Applies a batch in order and returns the messages it applied, reporting each one A2UI
		 * rejects through `onError` instead of throwing. Unlike A2UI's A2A binding, once an
		 * operation on a surface fails, the batch's later operations on that surface are skipped, so
		 * a rejected `createSurface` can't let its updates change an earlier surface with the same ID,
		 * and a rejected message leaves no surface it created.
		 */
		processMessages: (
			messages: InteractiveUiMessage[],
			ownerId: string
		): InteractiveUiMessage[] => {
			const applied: InteractiveUiMessage[] = [];
			const failedSurfaceIds = new Set< string >();

			currentOwnerId = ownerId;

			for ( const message of messages ) {
				const surfaceId = getInteractiveUiOperation( message )?.surfaceId;

				if ( surfaceId !== undefined && failedSurfaceIds.has( surfaceId ) ) {
					continue;
				}

				const isNewSurface = surfaceId !== undefined && ! processor.getSurface( surfaceId );

				try {
					processor.processMessages( [ message ] );
					applied.push( message );
				} catch ( error ) {
					if ( surfaceId !== undefined ) {
						failedSurfaceIds.add( surfaceId );
					}

					if ( isNewSurface && processor.getSurface( surfaceId ) ) {
						processor.model.deleteSurface( surfaceId );
					}

					onError(
						{
							code: error instanceof A2uiError ? error.code : 'UNKNOWN_ERROR',
							message: error instanceof Error ? error.message : String( error ),
							surfaceId,
						},
						ownerId
					);
				}
			}

			return applied;
		},
		/**
		 * A2UI's renderer data model for those of these surfaces that set `sendDataModel`, or
		 * `undefined` if none do. Unlike A2UI's, it covers only the surfaces given, such as those the
		 * user can still change, and leaves out the values obscured TextFields bind to, or the whole
		 * surface when it can't place one.
		 */
		getDataModel: ( surfaceIds: string[] ): InteractiveUiDataModel | undefined => {
			const surfaces: InteractiveUiDataModel[ 'surfaces' ] = {};

			for ( const surfaceId of surfaceIds ) {
				const surface = processor.getSurface( surfaceId );

				if ( ! surface?.sendDataModel ) {
					continue;
				}

				const obscuredPaths = getObscuredPaths( surface );

				if ( obscuredPaths === undefined ) {
					continue;
				}

				// A copy, as the surface's data model is live. It's JSON, as A2UI's sync sends it.
				const redacted = new DataModel(
					JSON.parse( JSON.stringify( surface.dataModel.get( '/' ) ) )
				);

				obscuredPaths.forEach( ( path ) => redacted.delete( path ) );
				surfaces[ surfaceId ] = redacted.get< Record< string, unknown > >( '/' );
			}

			return Object.keys( surfaces ).length > 0 ? { version: 'v1.0', surfaces } : undefined;
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
