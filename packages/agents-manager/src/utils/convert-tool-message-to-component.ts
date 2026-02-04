import EditorLink from '../components/editor-link';
import { isWpComEditorPage } from './is-wpcom-editor-page';
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

		// @ts-expect-error -- 'assistant' comes from Big Sky messages
		if ( ( message.role !== 'agent' && message.role !== 'assistant' ) || ! firstContentText ) {
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
			// If not on WP.com editor page, show a link to the site editor instead of the component
			if ( ! isWpComEditorPage() ) {
				return [
					{
						...message,
						content: [
							{
								type: 'component' as const,
								component: EditorLink,
							},
						],
					},
				];
			}

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

		// Remove unhandled tool messages to avoid displaying raw JSON to the user.
		return [];
	} );
}
