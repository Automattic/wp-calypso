import { getInteractiveUiOperation } from '@automattic/ai-ui-renderer/capabilities';
import { isChatUiStale } from '../utils/stale-chat-ui';
import type { A2uiDataPart, UIMessage } from '@automattic/agenttic-client';
import type { InteractiveUiMessage, InteractiveUiRuntime } from '@automattic/ai-ui-renderer';

/** The A2UI protocol version the interactive UI speaks. */
export const INTERACTIVE_UI_VERSION = 'v1.0';

/** The tool ID a surface's shared response events record. */
export const INTERACTIVE_UI_TOOL_ID = 'wpcom__render_interactive_ui';

interface InteractiveUiPart {
	operations: InteractiveUiMessage[];
	/** The page the part's surfaces were built for, if any. */
	postId?: number | string;
}

/** The A2UI messages in one part of an agent message. */
export interface InteractiveUiBatch extends InteractiveUiPart {
	messageId: string;
	/** Changes when the part does, so the host can tell an earlier batch changed. */
	signature: string;
}

/** A batch with only the messages the runtime applied. */
export interface AppliedInteractiveUiBatch extends InteractiveUiBatch {
	/** The runtime rejected some of the part's messages, so a live message shows a notice. */
	hasRejections: boolean;
}

/**
 * Reads the A2UI messages, and the page they were built for, from a message's content part.
 * Agenttic checks A2UI's A2A data part and keeps it under `a2ui`. Returns `undefined` for any
 * other part.
 */
export function readInteractiveUiPart(
	content: UIMessage[ 'content' ][ number ]
): InteractiveUiPart | undefined {
	const part =
		content.type === 'data' ? ( content.data?.a2ui as A2uiDataPart | undefined ) : undefined;

	if ( ! part ) {
		return undefined;
	}

	const { postId } = part.metadata;

	return {
		operations: part.data as InteractiveUiMessage[],
		...( ( typeof postId === 'number' || typeof postId === 'string' ) && { postId } ),
	};
}

/**
 * Reads the hidden context message an interactive UI action sends the agent, with the action's
 * trimmed `userMessage` if it has one. Returns `undefined` for any other message.
 */
export function readInteractiveUiActionMessage(
	message: UIMessage
): { userMessage?: string } | undefined {
	if ( message.role !== 'user' ) {
		return undefined;
	}

	for ( const content of message.content ) {
		if ( content.type !== 'context' || ! content.text ) {
			continue;
		}

		let parsed;

		try {
			parsed = JSON.parse( content.text );
		} catch {
			// Other context, such as a note of where the user navigated.
			continue;
		}

		const action: unknown = parsed?.version === INTERACTIVE_UI_VERSION ? parsed.action : undefined;

		if ( typeof action !== 'object' || action === null ) {
			continue;
		}

		const userMessage =
			'userMessage' in action && typeof action.userMessage === 'string'
				? action.userMessage.trim()
				: '';

		return userMessage ? { userMessage } : {};
	}

	return undefined;
}

/** Collects the interactive UI batches in agent messages, one per part that carries them. */
export function getInteractiveUiBatches( messages: UIMessage[] ): InteractiveUiBatch[] {
	return messages.flatMap( ( message ) => {
		if ( message.role !== 'agent' ) {
			return [];
		}

		return message.content.flatMap( ( content ) => {
			const part = readInteractiveUiPart( content );

			if ( ! part ) {
				return [];
			}

			return [
				{
					...part,
					messageId: message.id,
					signature: JSON.stringify( [ message.id, part ] ),
				},
			];
		} );
	} );
}

/**
 * Applies a batch and returns it with only the messages the runtime applied, so a rejected
 * message can't count as a change to its surface. The runtime reports each rejected one.
 */
export function applyInteractiveUiBatch(
	runtime: InteractiveUiRuntime,
	batch: InteractiveUiBatch
): AppliedInteractiveUiBatch {
	const applied = runtime.processMessages( batch.operations, batch.messageId );

	return { ...batch, operations: applied, hasRejections: applied.length < batch.operations.length };
}

interface StaleInteractiveUiSurfaceOptions {
	/** Each message's current index in the transcript, which a regenerate can shift. */
	messageIndexes: ReadonlyMap< string, number >;
	latestUserMessageIndex: number;
	/** The messages restored from history, such as a past chat's. */
	restoredMessageIds: ReadonlySet< string >;
	currentPostId?: number | string;
}

/**
 * The surfaces that are stale, by the rule `show-component` uses, and those restored from history,
 * as restored pickers are. Each one is judged by the current position of the message whose batch
 * last changed it, so a surface the agent updates in a later turn stays current, and keeps the page
 * it was built for. A surface whose message has left the transcript, as a regenerated reply does,
 * is stale too.
 */
export function getStaleInteractiveUiSurfaceIds(
	batches: InteractiveUiBatch[],
	{
		messageIndexes,
		latestUserMessageIndex,
		restoredMessageIds,
		currentPostId,
	}: StaleInteractiveUiSurfaceOptions
): Set< string > {
	const surfaces = new Map< string, { messageId: string; postId?: number | string } >();

	for ( const batch of batches ) {
		for ( const message of batch.operations ) {
			const operation = getInteractiveUiOperation( message );

			if ( operation?.name === 'deleteSurface' ) {
				surfaces.delete( operation.surfaceId );
			} else if ( operation ) {
				const previous =
					operation.name === 'createSurface' ? undefined : surfaces.get( operation.surfaceId );

				surfaces.set( operation.surfaceId, {
					messageId: batch.messageId,
					postId: batch.postId ?? previous?.postId,
				} );
			}
		}
	}

	const staleSurfaceIds = new Set< string >();

	for ( const [ surfaceId, { messageId, postId } ] of surfaces ) {
		const messageIndex = messageIndexes.get( messageId );

		if (
			restoredMessageIds.has( messageId ) ||
			messageIndex === undefined ||
			isChatUiStale( { messageIndex, latestUserMessageIndex, postId, currentPostId } )
		) {
			staleSurfaceIds.add( surfaceId );
		}
	}

	return staleSurfaceIds;
}

/** The live messages whose A2UI messages the runtime rejected some of. */
export function getRejectedInteractiveUiMessageIds(
	batches: AppliedInteractiveUiBatch[],
	restoredMessageIds: ReadonlySet< string >
): Set< string > {
	return new Set(
		batches
			.filter( ( batch ) => batch.hasRejections && ! restoredMessageIds.has( batch.messageId ) )
			.map( ( batch ) => batch.messageId )
	);
}

/**
 * The surfaces of the applied batches the user can use: each once, and none that's stale or hasn't
 * shown, as its root never arrived.
 */
export function getUsableInteractiveUiSurfaceIds(
	runtime: InteractiveUiRuntime,
	batches: InteractiveUiBatch[],
	staleSurfaceIds: ReadonlySet< string >
): string[] {
	const surfaceIds = batches.flatMap( ( batch ) => runtime.getSurfaceIds( batch.messageId ) );

	return [ ...new Set( surfaceIds ) ].filter( ( surfaceId ) => {
		const surface = runtime.getSurface( surfaceId );

		return !! surface?.componentsModel.has( surface.rootId ) && ! staleSurfaceIds.has( surfaceId );
	} );
}

/**
 * Leaves out the surfaces created or changed by a message that has left the transcript, such as a
 * reply being regenerated. The runtime keeps their data until it rebuilds once the agent is idle.
 */
export function keepInteractiveUiSurfacesInTranscript(
	surfaceIds: string[],
	batches: InteractiveUiBatch[],
	messageIndexes: ReadonlyMap< string, number >
): string[] {
	const removedSurfaceIds = new Set(
		batches
			.filter( ( batch ) => ! messageIndexes.has( batch.messageId ) )
			.flatMap( ( batch ) =>
				batch.operations.map( ( message ) => getInteractiveUiOperation( message )?.surfaceId )
			)
	);

	return surfaceIds.filter( ( surfaceId ) => ! removedSurfaceIds.has( surfaceId ) );
}
