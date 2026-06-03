import type {
	Message as ClientMessage,
	Part,
	TextPart,
} from '../client/types/index';
import { generateMessageId } from '../client/utils/core';

export interface RegenerateRequest {
	baseHistory: ClientMessage[];
	userMessage: ClientMessage;
	prompt: string;
}

const clonePart = ( part: Part ): Part => {
	if ( part.type === 'text' ) {
		return {
			...part,
			metadata: part.metadata ? { ...part.metadata } : undefined,
		};
	}

	if ( part.type === 'file' ) {
		return {
			...part,
			file: { ...part.file },
			metadata: part.metadata ? { ...part.metadata } : undefined,
		};
	}

	return {
		...part,
		data: { ...( part as { data: Record< string, unknown > } ).data },
		metadata: part.metadata ? { ...part.metadata } : undefined,
	} as Part;
};

const getVisiblePromptText = ( message: ClientMessage ): string => {
	return message.parts
		.filter(
			( part ): part is TextPart =>
				part.type === 'text' && part.metadata?.contentType !== 'context'
		)
		.map( ( part ) => part.text )
		.join( '\n' )
		.trim();
};

const cloneUserMessageForRegenerate = (
	message: ClientMessage
): ClientMessage => ( {
	...message,
	messageId: generateMessageId(),
	metadata: {
		...( message.metadata || {} ),
		timestamp: Date.now(),
	},
	parts: message.parts.map( clonePart ),
} );

const getRegenerateSource = (
	messages: ClientMessage[],
	agentMessageId: string
): RegenerateRequest | null => {
	const agentMessageIndex = messages.findIndex(
		( message ) =>
			message.messageId === agentMessageId && message.role === 'agent'
	);

	if ( agentMessageIndex === -1 ) {
		return null;
	}

	let userMessageIndex = -1;
	for ( let i = agentMessageIndex - 1; i >= 0; i-- ) {
		if ( messages[ i ].role === 'user' ) {
			userMessageIndex = i;
			break;
		}
	}

	if ( userMessageIndex === -1 ) {
		return null;
	}

	const userMessage = messages[ userMessageIndex ];
	const prompt = getVisiblePromptText( userMessage );

	if ( ! prompt ) {
		return null;
	}

	return {
		baseHistory: messages.slice( 0, userMessageIndex ),
		userMessage,
		prompt,
	};
};

export const getRegenerateRequest = (
	messages: ClientMessage[],
	agentMessageId: string
): RegenerateRequest | null => {
	const source = getRegenerateSource( messages, agentMessageId );

	if ( ! source ) {
		return null;
	}

	return {
		...source,
		userMessage: cloneUserMessageForRegenerate( source.userMessage ),
	};
};

export const canRegenerateAgentMessage = (
	messages: ClientMessage[],
	agentMessageId: string
): boolean => Boolean( getRegenerateSource( messages, agentMessageId ) );

export const getLatestRegeneratableAgentMessageId = (
	messages: ClientMessage[]
): string | null => {
	for ( let i = messages.length - 1; i >= 0; i-- ) {
		const message = messages[ i ];

		if (
			message.role === 'agent' &&
			canRegenerateAgentMessage( messages, message.messageId )
		) {
			return message.messageId;
		}
	}

	return null;
};
