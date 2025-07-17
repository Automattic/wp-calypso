import type { Message } from '../types';

export const setMessages = ( messages: Message[] ) => ( {
	type: 'SET_MESSAGES' as const,
	messages,
} );

export const addMessage = ( message: Message ) => ( {
	type: 'ADD_MESSAGE' as const,
	message,
} );

export const deleteMessage = ( id: string ) => ( {
	type: 'DELETE_MESSAGE' as const,
	id,
} );

export const clearMessages = () => ( {
	type: 'CLEAR_MESSAGES' as const,
} );

export const addUserMessage = ( content: string, imageUrls: string[] = [] ) => {
	const message: Message = {
		id: crypto.randomUUID(),
		role: 'user',
		content: [
			{ type: 'text', text: content },
			...imageUrls.map( ( url ) => ( {
				type: 'image_url' as const,
				image_url: url,
			} ) ),
		],
		created_at: Date.now(),
		archived: false,
		showIcon: true,
	};

	return addMessage( message );
};

export const assistantSay = (
	content: string,
	additionalProps: Partial< Message > = {}
) => {
	const message: Message = {
		id: crypto.randomUUID(),
		role: 'assistant',
		content: [ { type: 'text', text: content } ],
		created_at: Date.now(),
		archived: false,
		showIcon: true,
		...additionalProps,
	};

	return addMessage( message );
};

export const addMessageToDelete = ( message: Message ) => ( {
	type: 'ADD_MESSAGE_TO_DELETE' as const,
	message,
} );

export const clearMessagesToDelete = () => ( {
	type: 'CLEAR_MESSAGES_TO_DELETE' as const,
} );

export const deleteCompletedPlanMessages =
	() =>
	( { select, dispatch }: any ) => {
		const messages = select.getMessages();
		const completedPlanMessages = messages.filter( ( message: Message ) =>
			message.content.some(
				( content ) =>
					content.type === 'text' &&
					content.text?.includes( 'CompletedPlan' )
			)
		);

		completedPlanMessages.forEach( ( message: Message ) => {
			dispatch.deleteMessage( message.id );
		} );
	};
