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
	messageIndex: number;
	/** Changes when the part does, so the host can tell an earlier batch changed. */
	signature: string;
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

/** Whether a message is the hidden context message an interactive UI action sends to the agent. */
export function isInteractiveUiActionMessage( message: UIMessage ): boolean {
	return (
		message.role === 'user' &&
		message.content.some( ( content ) => {
			if ( content.type !== 'context' || ! content.text ) {
				return false;
			}

			try {
				const parsed = JSON.parse( content.text );
				return parsed?.version === INTERACTIVE_UI_VERSION && typeof parsed.action === 'object';
			} catch {
				return false;
			}
		} )
	);
}

/** Collects the interactive UI batches in agent messages, one per part that carries them. */
export function getInteractiveUiBatches( messages: UIMessage[] ): InteractiveUiBatch[] {
	return messages.flatMap( ( message, messageIndex ) => {
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
					messageIndex,
					signature: JSON.stringify( [ message.id, part ] ),
				},
			];
		} );
	} );
}

/**
 * Applies a batch's messages one by one and returns the batch with only those the runtime
 * accepted, so a rejected message can't count as a change to its surface.
 */
export function applyInteractiveUiBatch(
	runtime: InteractiveUiRuntime,
	batch: InteractiveUiBatch
): InteractiveUiBatch {
	return {
		...batch,
		operations: batch.operations.filter( ( message ) => {
			try {
				runtime.processMessages( [ message ], batch.messageId );
				return true;
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( '[AgentsManager] Failed to apply an interactive UI message:', error );
				return false;
			}
		} ),
	};
}

// Every A2UI message holds one operation, keyed by its name, on one surface. The agent's messages
// aren't validated, so any entry may be malformed.
function getOperation( message: unknown ): { name: string; surfaceId: string } | undefined {
	if ( typeof message !== 'object' || message === null ) {
		return undefined;
	}

	const [ name, operation ] =
		Object.entries( message ).find( ( [ key ] ) => key !== 'version' ) ?? [];
	const surfaceId =
		typeof operation === 'object' && operation !== null && 'surfaceId' in operation
			? operation.surfaceId
			: undefined;

	return name && typeof surfaceId === 'string' ? { name, surfaceId } : undefined;
}

interface StaleInteractiveUiSurfaceOptions {
	latestUserMessageIndex: number;
	/** The signatures of batches restored from history, such as a past chat's. */
	restoredSignatures: ReadonlySet< string >;
	currentPostId?: number | string;
}

/**
 * The surfaces that are stale, by the rule `show-component` uses, and those restored from history,
 * as restored pickers are. Each one is judged by the last batch that changed it, so a surface the
 * agent updates in a later turn stays current, and keeps the page it was built for.
 */
export function getStaleInteractiveUiSurfaceIds(
	batches: InteractiveUiBatch[],
	{ latestUserMessageIndex, restoredSignatures, currentPostId }: StaleInteractiveUiSurfaceOptions
): Set< string > {
	const surfaces = new Map<
		string,
		{ messageIndex: number; postId?: number | string; isRestored: boolean }
	>();

	for ( const batch of batches ) {
		for ( const message of batch.operations ) {
			const operation = getOperation( message );

			if ( operation?.name === 'deleteSurface' ) {
				surfaces.delete( operation.surfaceId );
			} else if ( operation ) {
				const previous =
					operation.name === 'createSurface' ? undefined : surfaces.get( operation.surfaceId );

				surfaces.set( operation.surfaceId, {
					messageIndex: batch.messageIndex,
					postId: batch.postId ?? previous?.postId,
					isRestored: restoredSignatures.has( batch.signature ),
				} );
			}
		}
	}

	const staleSurfaceIds = new Set< string >();

	for ( const [ surfaceId, { messageIndex, postId, isRestored } ] of surfaces ) {
		if (
			isRestored ||
			isChatUiStale( { messageIndex, latestUserMessageIndex, postId, currentPostId } )
		) {
			staleSurfaceIds.add( surfaceId );
		}
	}

	return staleSurfaceIds;
}
