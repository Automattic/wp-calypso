import { EscalationButton } from '../components/escalation-button';
import NextStepButton from '../components/next-step-button';
import UnavailableToolMessage from '../components/unavailable-tool-message';
import { isEditorPage } from './is-editor-page';
import { isShowComponentTool } from './show-component-tools';
import { getDisplayMessageFromToolData, isDisplayableToolMessageTool } from './tool-message-utils';
import type { GetChatComponent } from './load-external-providers';
import type { UIMessage, UseAgentChatReturn } from '@automattic/agenttic-client';

export type AgentsManagerUIMessage = UIMessage & {
	disabled?: boolean;
	/** Suppress Agenttic's transient thinking indicator while this message is the latest one. */
	suppressThinking?: boolean;
};

interface Options {
	messages: UIMessage[];
	getChatComponent?: GetChatComponent;
	currentPostId?: number;
	onSubmit: UseAgentChatReturn[ 'onSubmit' ];
}

/**
 * Converts tool-related messages to component messages.
 */
export default function convertToolMessagesToComponents( {
	messages,
	getChatComponent,
	currentPostId,
	onSubmit,
}: Options ): AgentsManagerUIMessage[] {
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

		// Handle `show-component` tool message
		if ( isShowComponentTool( textData.tool_id ) ) {
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

			const toolData = textData.data ?? {};
			const { type: contentType, props, followUpTasks, isCurrent, postId, summary } = toolData;
			const Component = getChatComponent?.( contentType );

			// No matching component found for this content type — drop the message to avoid showing raw JSON.
			if ( ! Component ) {
				return [];
			}

			const summaryText =
				typeof summary === 'string' && summary.trim() ? summary.trim() : undefined;

			// Whether this is the last message in the array.
			const isLastMessage = index === array.length - 1;

			// In the site editor, React-Query caching keeps past conversations alive when the
			// user navigates to a different page. Compare the picker's `postId` with the
			// current editor page to disable pickers that no longer belong to this page.
			const isPageChanged = !! postId && !! currentPostId && postId !== currentPostId;
			const isStale = ! isLastMessage || ! isCurrent || isPageChanged;

			const componentMessage: AgentsManagerUIMessage = {
				...message,
				content: [
					...( summaryText
						? [
								{
									type: 'text' as const,
									text: summaryText,
								},
						  ]
						: [] ),
					{
						type: 'component' as const,
						component: Component,
						componentProps: {
							...props,
							...( summaryText && { summary: summaryText } ),
							contentType,
						},
					},
				],
				disabled: isStale,
				suppressThinking: true,
			};

			// Only show `next-step-button` when the component is active and has follow-up tasks.
			if ( isStale || ! followUpTasks ) {
				return [ componentMessage ];
			}

			// Omit `actions` so the parent message's actions don't leak into the next-step message.
			const { actions, content, ...baseMessage } = message;

			return [
				componentMessage,
				{
					...baseMessage,
					id: `${ message.id }-next-step`,
					content: [
						{
							type: 'component' as const,
							component: NextStepButton as React.ComponentType,
							componentProps: { onMoveToNextStep: onSubmit },
						},
					],
				},
			];
		}

		// Handle agent-facing Big Sky tool result summaries.
		if ( isDisplayableToolMessageTool( textData.tool_id ) ) {
			const summary = getDisplayMessageFromToolData( textData.data );
			if ( ! summary ) {
				return [];
			}

			return [
				{
					...message,
					suppressThinking: true,
					content: [
						{
							type: 'text' as const,
							text: summary,
						},
					],
				},
			];
		}

		// Handle `wordpress-com-support` tool message
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
		console.warn( `[AgentsManager] Unhandled tool message with tool_id: ${ textData.tool_id }` );
		return [];
	} );
}
