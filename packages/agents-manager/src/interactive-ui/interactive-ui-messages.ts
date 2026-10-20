import type { UIMessage } from '@automattic/agenttic-client';
import type { InteractiveUiMessage } from '@automattic/ai-ui';

export function getInteractiveUiMessagesFromText(
	text?: string
): InteractiveUiMessage[] | undefined {
	if ( ! text ) {
		return undefined;
	}
	try {
		const parsed = JSON.parse( text );
		const payload = parsed?.tool_id === 'wpcom__render_interactive_ui' ? parsed.data : parsed;
		const messages = typeof payload === 'string' ? JSON.parse( payload ) : payload;
		return Array.isArray( messages ) && messages[ 0 ]?.version === 'v0.9' ? messages : undefined;
	} catch {}
	return undefined;
}

export function getInteractiveUiBatches( messages: UIMessage[] ) {
	return messages.flatMap( ( message ) =>
		message.role === 'agent'
			? message.content.flatMap( ( content, index ) => {
					const operations = getInteractiveUiMessagesFromText( content.text );
					return operations
						? [
								{
									messageId: message.id,
									operations,
									signature: JSON.stringify( [ message.id, index, content.text ] ),
								},
							]
						: [];
				} )
			: []
	);
}
