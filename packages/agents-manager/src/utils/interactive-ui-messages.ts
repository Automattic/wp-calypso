import type { UIMessage } from '@automattic/agenttic-client';
import type { InteractiveUiMessage } from '@automattic/ai-ui-renderer';

/** The A2UI protocol version the interactive UI speaks. */
export const INTERACTIVE_UI_VERSION = 'v0.9';

const INTERACTIVE_UI_TOOL_ID = 'wpcom__render_interactive_ui';

/**
 * Reads the A2UI messages in a text part: wpcom's `wpcom__render_interactive_ui` envelope or a
 * raw message array. Returns `undefined` for any other text.
 */
export function getInteractiveUiMessagesFromText(
	text?: string
): InteractiveUiMessage[] | undefined {
	if ( ! text ) {
		return undefined;
	}

	try {
		const parsed = JSON.parse( text );
		const payload = parsed?.tool_id === INTERACTIVE_UI_TOOL_ID ? parsed.data : parsed;
		const messages = typeof payload === 'string' ? JSON.parse( payload ) : payload;

		const isInteractiveUi =
			Array.isArray( messages ) && messages[ 0 ]?.version === INTERACTIVE_UI_VERSION;
		return isInteractiveUi ? messages : undefined;
	} catch {
		// Text that isn't JSON is an ordinary reply, not interactive UI.
		return undefined;
	}
}

/** Collects the interactive UI batches in agent messages, one per text part that carries them. */
export function getInteractiveUiBatches( messages: UIMessage[] ) {
	return messages.flatMap( ( message ) => {
		if ( message.role !== 'agent' ) {
			return [];
		}

		return message.content.flatMap( ( content, index ) => {
			const operations = getInteractiveUiMessagesFromText( content.text );
			if ( ! operations ) {
				return [];
			}

			return [
				{
					messageId: message.id,
					operations,
					signature: JSON.stringify( [ message.id, index, content.text ] ),
				},
			];
		} );
	} );
}
