import type { A2uiMessage } from '@a2ui/web_core/v0_9';
import type { UIMessage } from '@automattic/agenttic-client';

export function getA2uiMessagesFromText( text?: string ): A2uiMessage[] | undefined {
	if ( ! text ) {
		return undefined;
	}
	try {
		const parsed = JSON.parse( text );
		const payload = parsed?.tool_id === 'wpcom__a2ui' ? parsed.data : parsed;
		const messages = typeof payload === 'string' ? JSON.parse( payload ) : payload;
		return Array.isArray( messages ) && messages[ 0 ]?.version === 'v0.9' ? messages : undefined;
	} catch {}
	return undefined;
}

export function getA2uiBatches( messages: UIMessage[] ) {
	return messages.flatMap( ( message ) =>
		message.role === 'agent'
			? message.content.flatMap( ( content, index ) => {
					const operations = getA2uiMessagesFromText( content.text );
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
