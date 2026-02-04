import type { GetChatComponent } from './load-external-providers';
import type { UIMessage } from '@automattic/agenttic-client';

interface Options {
	messages: UIMessage[];
	getChatComponent?: GetChatComponent;
}

/**
 * Converts tool-related messages to component messages.
 */
export function convertToolMessagesToComponents( {
	messages,
	getChatComponent,
}: Options ): UIMessage[] {
	return messages.flatMap( ( message, index, array ) => {
		const firstContentText = message.content?.[ 0 ]?.text;

		if ( message.role !== 'agent' || ! firstContentText ) {
			return [ message ];
		}

		// The tool message is a JSON string. Try to parse it, falling back to the original if invalid.
		let textData;
		try {
			textData = JSON.parse( firstContentText );
		} catch ( _error ) {
			return [ message ];
		}

		// Handle show-component ability component messages
		if ( textData.tool_id === 'big_sky__show_component' ) {
			const { type: contentType, props, followUpTasks } = textData.data ?? {};
			const Component = getChatComponent?.( contentType );

			// Filter out the raw JSON message to avoid showing it to the user
			if ( ! Component ) {
				return [];
			}

			const componentMessage = {
				...message,
				content: [
					{
						type: 'component' as const,
						component: Component,
						componentProps: { ...props, contentType },
					},
				],
			};

			// Only show `next-step-button` after the most recent component message with follow-up tasks
			const isLastMessage = index === array.length - 1;
			const NextStepButton = getChatComponent?.( 'next-step-button' );
			if ( ! isLastMessage || ! followUpTasks || ! NextStepButton ) {
				return [ componentMessage ];
			}

			return [
				componentMessage,
				{
					...message,
					id: `${ message.id }-next-step`,
					content: [
						{
							type: 'component' as const,
							component: NextStepButton,
						},
					],
				},
			];
		}

		return [ message ];
	} );
}
