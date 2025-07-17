export const setThinking = ( isThinking: boolean ) => ( {
	type: 'SET_THINKING' as const,
	isThinking,
} );

export const setIsSendingMessage = ( isSendingMessage: boolean ) => ( {
	type: 'SET_SENDING_MESSAGE' as const,
	isSendingMessage,
} );

export const setIsTyping = ( isTyping: boolean ) => ( {
	type: 'SET_TYPING' as const,
	isTyping,
} );

export const setAssistant = ( assistant: string ) => ( {
	type: 'SET_ASSISTANT' as const,
	assistant,
} );

export const setPendingToolCallbacks = ( count: number ) => ( {
	type: 'SET_PENDING_TOOL_CALLBACKS' as const,
	count,
} );

export const setCurrentToolCall = ( toolCall: string ) => ( {
	type: 'SET_CURRENT_TOOL_CALL' as const,
	toolCall,
} );

export const setError = ( error: string | null ) => ( {
	type: 'SET_ERROR' as const,
	error,
} );
