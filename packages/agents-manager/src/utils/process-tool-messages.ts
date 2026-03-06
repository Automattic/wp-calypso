import { EscalationButton } from '../components/escalation-button';
import UnavailableToolMessage from '../components/unavailable-tool-message';
import { isEditorPage } from './is-editor-page';
import type { GetChatComponent } from './load-external-providers';
import type { UIMessage } from '@automattic/agenttic-client';

interface Options {
	messages: UIMessage[];
	getChatComponent?: GetChatComponent;
	currentPostId?: number;
}

/**
 * Converts tool-related messages to component messages.
 */
export function convertToolMessagesToComponents( {
	messages,
	getChatComponent,
	currentPostId,
}: Options ): UIMessage[] {
	return messages.flatMap( ( message, index, array ) => {
		const firstContentText = message.content?.[ 0 ]?.text;

		// @ts-expect-error -- `assistant` comes from Big Sky messages
		if ( ( message.role !== 'agent' && message.role !== 'assistant' ) || ! firstContentText ) {
			return [ message ];
		}

		// The user asked for human support
		if (
			message.content.find(
				( content ) =>
					content.type === 'data' &&
					content.data?.flags &&
					typeof content.data.flags === 'object' &&
					'forward_to_human_support' in content.data.flags
			)
		) {
			return {
				...message,
				content: [
					{
						type: 'component',
						component: EscalationButton,
					},
				],
			};
		}

		// The tool message is a JSON string. Try to parse it, falling back to the original if invalid
		let textData;
		try {
			textData = JSON.parse( firstContentText );
		} catch ( _error ) {
			return [ message ];
		}

		// Handle `show-component` ability tool message
		if ( textData.tool_id === 'big_sky__show_component' ) {
			// If not on an editor page, show an unavailable tool message instead of the component
			if ( ! isEditorPage() ) {
				return [
					{
						...message,
						content: [
							{
								type: 'component' as const,
								component: UnavailableToolMessage as React.ComponentType,
								componentProps: { type: 'picker' },
							},
						],
					},
				];
			}

			const { type: contentType, props, followUpTasks, isCurrent, postId } = textData.data ?? {};
			const Component = getChatComponent?.( contentType );

			// No matching component found for this content type — drop the message to avoid showing raw JSON.
			if ( ! Component ) {
				return [];
			}

			// Whether this is the last message in the array.
			const isLastMessage = index === array.length - 1;

			// In the site editor, React-Query caching keeps past conversations alive when the
			// user navigates to a different page. Compare the picker's `postId` with the
			// current editor page to disable pickers that no longer belong to this page.
			const isPageChanged = !! postId && !! currentPostId && postId !== currentPostId;
			const isStale = ! isLastMessage || ! isCurrent || isPageChanged;

			const componentMessage = {
				...message,
				content: [
					{
						type: 'component' as const,
						component: Component,
						componentProps: { ...props, contentType },
					},
				],
				disabled: isStale,
				// Tag for `disablePickersAndRemoveNextButton` to disable on back-navigation.
				isShowComponentMessage: true,
			};

			// Only show `next-step-button` when the component is active and has follow-up tasks.
			const NextStepButton = getChatComponent?.( 'next-step-button' );
			if ( isStale || ! followUpTasks || ! NextStepButton ) {
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
					// Tag for `disablePickersAndRemoveNextButton` to remove on back-navigation.
					isNextStepButton: true,
				},
			];
		}

		// Handle support tool message by rendering its data as plain text
		if (
			textData.tool_id === 'big_sky__wordpress_com_support' &&
			typeof textData.data === 'string'
		) {
			return [
				{
					...message,
					content: [
						{
							type: 'text' as const,
							text: textData.data,
						},
					],
				},
			];
		}

		// Handle start over tool message
		if (
			textData.tool_id === 'big_sky__client_assistants' &&
			textData.data?.assistantId === 'big-sky-site-admin'
		) {
			return [
				{
					...message,
					content: [
						{
							type: 'component' as const,
							component: UnavailableToolMessage as React.ComponentType,
							componentProps: { type: 'start-over' },
						},
					],
				},
			];
		}

		// Remove unhandled tool messages to avoid displaying raw JSON to the user.
		// eslint-disable-next-line no-console
		console.warn( `[Agents Manager] Unhandled tool message with tool_id: ${ textData.tool_id }` );
		return [];
	} );
}

/**
 * Disables stale picker components and removes next-step buttons on back-navigation.
 */
export function disablePickersAndRemoveNextButton( messages: UIMessage[] ): UIMessage[] {
	return messages.flatMap( ( message ) => {
		// @ts-ignore -- custom flag not on the `UIMessage` type.
		if ( message.isNextStepButton ) {
			return [];
		}

		// @ts-ignore -- custom flag not on the `UIMessage` type.
		if ( message.isShowComponentMessage ) {
			return [ { ...message, disabled: true } ];
		}

		return [ message ];
	} );
}
