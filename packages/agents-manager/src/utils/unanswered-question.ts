import type { Message } from '@automattic/agenttic-client';

const serverIdOf = ( message: Message | undefined ): number => {
	const id = message?.metadata?.serverId;
	return typeof id === 'number' ? id : 0;
};

// By server id, which grows with every stored message.
const newestOf = ( messages: Message[] ): Message | undefined =>
	messages.reduce< Message | undefined >(
		( newest, message ) => ( serverIdOf( message ) > serverIdOf( newest ) ? message : newest ),
		undefined
	);

const textOf = ( message: Message ): string =>
	message.parts
		.map( ( part ) => ( part.type === 'text' ? part.text : '' ) )
		.join( '' )
		.trim();

// The server stores tool results as agent rows whose text is JSON with a `tool_id`.
const isToolResult = ( message: Message ): boolean => {
	try {
		return typeof JSON.parse( textOf( message ) )?.tool_id === 'string';
	} catch {
		return false;
	}
};

/**
 * The highest server id in a loaded conversation.
 * @param messages The loaded conversation.
 * @returns The id, or 0 when no message has one.
 */
export function getNewestServerId( messages: Message[] ): number {
	return serverIdOf( newestOf( messages ) );
}

/**
 * The user's last question, while the conversation has no reply to it yet.
 * @param messages The loaded conversation.
 * @returns The question, whether it had attachments, and when the conversation last
 * changed, or `undefined`.
 */
export function getUnansweredQuestion(
	messages: Message[]
): { text: string; hasFiles: boolean; lastActivityAt: number } | undefined {
	const newest = newestOf( messages );
	if ( ! newest || ( newest.role !== 'user' && ! isToolResult( newest ) ) ) {
		return undefined;
	}

	const question = newestOf( messages.filter( ( message ) => message.role === 'user' ) );
	const text = question ? textOf( question ) : '';
	const hasFiles = !! question?.parts.some( ( part ) => part.type === 'file' );
	if ( ! text && ! hasFiles ) {
		return undefined;
	}

	const lastActivityAt = newest.metadata?.timestamp;

	return {
		text,
		hasFiles,
		lastActivityAt: typeof lastActivityAt === 'number' ? lastActivityAt : 0,
	};
}
