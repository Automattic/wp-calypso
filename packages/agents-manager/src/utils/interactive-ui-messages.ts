import { isChatUiStale } from './stale-chat-ui';
import type { UIMessage } from '@automattic/agenttic-client';
import type { InteractiveUiMessage } from '@automattic/ai-ui-renderer';

/** The A2UI protocol version the interactive UI speaks. */
export const INTERACTIVE_UI_VERSION = 'v0.9';

const INTERACTIVE_UI_TOOL_ID = 'wpcom__render_interactive_ui';

interface ParsedInteractiveUiText {
	operations: InteractiveUiMessage[];
	/** The page the envelope's surfaces were built for, if any. */
	postId?: number | string;
}

/** The A2UI messages in one text part of an agent message. */
export interface InteractiveUiBatch extends ParsedInteractiveUiText {
	messageId: string;
	messageIndex: number;
	/** Changes when the text part does, so the host can tell an earlier batch changed. */
	signature: string;
}

/**
 * Reads the A2UI messages in a text part: wpcom's `wpcom__render_interactive_ui` envelope, with
 * the page it was built for, or a raw message array. Returns `undefined` for any other text.
 */
export function parseInteractiveUiText( text?: string ): ParsedInteractiveUiText | undefined {
	if ( ! text ) {
		return undefined;
	}

	try {
		const parsed = JSON.parse( text );
		const isEnvelope = parsed?.tool_id === INTERACTIVE_UI_TOOL_ID;
		const payload = isEnvelope ? parsed.data : parsed;
		const operations = typeof payload === 'string' ? JSON.parse( payload ) : payload;

		if ( ! Array.isArray( operations ) || operations[ 0 ]?.version !== INTERACTIVE_UI_VERSION ) {
			return undefined;
		}

		const postId = isEnvelope ? parsed.post_id : undefined;

		return {
			operations,
			...( ( typeof postId === 'number' || typeof postId === 'string' ) && { postId } ),
		};
	} catch {
		// Text that isn't JSON is an ordinary reply, not interactive UI.
		return undefined;
	}
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

/** Collects the interactive UI batches in agent messages, one per text part that carries them. */
export function getInteractiveUiBatches( messages: UIMessage[] ): InteractiveUiBatch[] {
	return messages.flatMap( ( message, messageIndex ) => {
		if ( message.role !== 'agent' ) {
			return [];
		}

		return message.content.flatMap( ( content, contentIndex ) => {
			const parsedText = parseInteractiveUiText( content.text );
			if ( ! parsedText ) {
				return [];
			}

			return [
				{
					...parsedText,
					messageId: message.id,
					messageIndex,
					signature: JSON.stringify( [ message.id, contentIndex, content.text ] ),
				},
			];
		} );
	} );
}

// Every A2UI message holds one operation, keyed by its name, on one surface.
function getSurfaceId( { version: _version, ...operation }: InteractiveUiMessage ): unknown {
	return Object.values( operation )[ 0 ]?.surfaceId;
}

interface StaleInteractiveUiSurfaceOptions {
	latestUserMessageIndex: number;
	currentPostId?: number | string;
}

/**
 * The surfaces that are stale, by the rule `show-component` uses. Each one is judged by the last
 * batch that changed it, so a surface the agent updates in a later turn stays current.
 */
export function getStaleInteractiveUiSurfaceIds(
	batches: InteractiveUiBatch[],
	{ latestUserMessageIndex, currentPostId }: StaleInteractiveUiSurfaceOptions
): Set< string > {
	const lastBatchBySurfaceId = new Map< string, InteractiveUiBatch >();

	for ( const batch of batches ) {
		for ( const operation of batch.operations ) {
			const surfaceId = getSurfaceId( operation );

			if ( typeof surfaceId === 'string' ) {
				lastBatchBySurfaceId.set( surfaceId, batch );
			}
		}
	}

	const staleSurfaceIds = new Set< string >();

	for ( const [ surfaceId, { messageIndex, postId } ] of lastBatchBySurfaceId ) {
		if ( isChatUiStale( { messageIndex, latestUserMessageIndex, postId, currentPostId } ) ) {
			staleSurfaceIds.add( surfaceId );
		}
	}

	return staleSurfaceIds;
}
