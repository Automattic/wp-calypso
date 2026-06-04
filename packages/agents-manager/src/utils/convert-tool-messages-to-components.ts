import { EscalationButton } from '../components/escalation-button';
import NextStepButton from '../components/next-step-button';
import UnavailableToolMessage from '../components/unavailable-tool-message';
import { isEditorPage } from './is-editor-page';
import { isShowComponentTool } from './show-component-tools';
import { getDisplayMessageFromToolData, isDisplayableToolMessageTool } from './tool-message-utils';
import type { GetChatComponent } from './load-external-providers';
import type { UIMessage, UseAgentChatReturn } from '@automattic/agenttic-client';

type ShowComponentToolCall = {
	toolCallId: string;
	toolId: string;
	data: Record< string, unknown >;
};

export type AgentsManagerUIMessage = UIMessage & {
	disabled?: boolean;
	/** Suppress Agenttic's transient thinking indicator while this message is the latest one. */
	suppressThinking?: boolean;
};

interface Options {
	messages: UIMessage[];
	getChatComponent?: GetChatComponent;
	currentPostId?: number;
	isEditorContext?: boolean;
	onSubmit: UseAgentChatReturn[ 'onSubmit' ];
}

function getShowComponentToolCall( message: UIMessage ): ShowComponentToolCall | undefined {
	const toolCall = message.content?.find(
		( content ) =>
			content.type === 'data' &&
			content.data &&
			typeof content.data.toolCallId === 'string' &&
			typeof content.data.toolId === 'string' &&
			isShowComponentTool( content.data.toolId ) &&
			typeof content.data.arguments === 'object' &&
			content.data.arguments !== null
	);

	if ( ! toolCall?.data ) {
		return undefined;
	}

	return {
		toolCallId: toolCall.data.toolCallId as string,
		toolId: toolCall.data.toolId as string,
		data: toolCall.data.arguments as Record< string, unknown >,
	};
}

function getToolResultCallId( message: UIMessage ): string | undefined {
	const toolResult = message.content?.find(
		( content ) =>
			content.type === 'data' &&
			content.data &&
			typeof content.data.toolCallId === 'string' &&
			'result' in content.data
	);

	return toolResult?.data?.toolCallId as string | undefined;
}

function findPreviousShowComponentToolCall(
	messages: UIMessage[],
	currentIndex: number,
	toolCallId: string
): ShowComponentToolCall | undefined {
	for ( let i = currentIndex - 1; i >= 0; i-- ) {
		const toolCall = getShowComponentToolCall( messages[ i ] );
		if ( toolCall?.toolCallId === toolCallId ) {
			return toolCall;
		}
	}

	return undefined;
}

function hasLaterToolResult(
	messages: UIMessage[],
	currentIndex: number,
	toolCallId: string
): boolean {
	for ( let i = currentIndex + 1; i < messages.length; i++ ) {
		if ( getToolResultCallId( messages[ i ] ) === toolCallId ) {
			return true;
		}
	}

	return false;
}

function hasLaterShowComponentMessage( messages: UIMessage[], currentIndex: number ): boolean {
	for ( let i = currentIndex + 1; i < messages.length; i++ ) {
		const firstContentText = messages[ i ].content?.[ 0 ]?.text;
		if ( ! firstContentText ) {
			continue;
		}

		try {
			const textData = JSON.parse( firstContentText );
			if ( isShowComponentTool( textData.tool_id ) ) {
				return true;
			}
		} catch ( _error ) {
			// Ignore non-JSON text messages.
		}
	}

	return false;
}

function getShowComponentCheckpoint( data: Record< string, unknown > ): string | undefined {
	return typeof data.calypsoCheckpointId === 'string' ? data.calypsoCheckpointId : undefined;
}

function hasLaterMatchingShowComponentMessage(
	messages: UIMessage[],
	currentIndex: number,
	toolId: string,
	data: Record< string, unknown >
): boolean {
	const checkpointId = getShowComponentCheckpoint( data );
	if ( ! checkpointId ) {
		return false;
	}

	for ( let i = currentIndex + 1; i < messages.length; i++ ) {
		const firstContentText = messages[ i ].content?.[ 0 ]?.text;
		if ( ! firstContentText ) {
			continue;
		}

		try {
			const textData = JSON.parse( firstContentText );
			if (
				textData.tool_id === toolId &&
				typeof textData.data === 'object' &&
				textData.data !== null &&
				getShowComponentCheckpoint( textData.data as Record< string, unknown > ) === checkpointId
			) {
				return true;
			}
		} catch ( _error ) {
			// Ignore non-JSON text messages.
		}
	}

	return false;
}

function hasLaterMatchingShowComponentToolResult(
	messages: UIMessage[],
	currentIndex: number,
	toolId: string,
	data: Record< string, unknown >
): boolean {
	const contentType = typeof data.type === 'string' ? data.type : undefined;
	const checkpointId = getShowComponentCheckpoint( data );

	for ( let i = currentIndex + 1; i < messages.length; i++ ) {
		const toolResultCallId = getToolResultCallId( messages[ i ] );
		if ( ! toolResultCallId ) {
			continue;
		}

		if ( checkpointId && toolResultCallId === checkpointId ) {
			return true;
		}

		const previousToolCall = findPreviousShowComponentToolCall( messages, i, toolResultCallId );
		if ( ! previousToolCall || previousToolCall.toolId !== toolId ) {
			continue;
		}

		if ( checkpointId && previousToolCall.toolCallId === checkpointId ) {
			return true;
		}

		if ( ! checkpointId && contentType && previousToolCall.data.type === contentType ) {
			return true;
		}
	}

	return false;
}

/**
 * Converts tool-related messages to component messages.
 */
export default function convertToolMessagesToComponents( {
	messages,
	getChatComponent,
	currentPostId,
	isEditorContext = false,
	onSubmit,
}: Options ): AgentsManagerUIMessage[] {
	const renderShowComponentMessage = (
		message: UIMessage,
		index: number,
		array: UIMessage[],
		toolId: string,
		data: Record< string, unknown >,
		forceCurrent = false
	): AgentsManagerUIMessage[] => {
		// If not on an editor page, show an unavailable tool message instead of the component
		if ( ! isEditorPage() && ! isEditorContext ) {
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

		const { type: contentType, props = {}, followUpTasks, isCurrent, postId, summary } = data;
		if ( typeof contentType !== 'string' ) {
			return [];
		}

		const Component = getChatComponent?.( contentType, { toolId } );

		// No matching component found for this content type — drop the message to avoid showing raw JSON.
		if ( ! Component ) {
			return [];
		}

		const componentProps = typeof props === 'object' && props !== null ? props : {};
		const summaryText = typeof summary === 'string' && summary.trim() ? summary.trim() : undefined;

		// Whether this is the last show-component message in the array.
		const isLastMessage = forceCurrent || index === array.length - 1;

		// In the site editor, React-Query caching keeps past conversations alive when the
		// user navigates to a different page. Compare the picker's `postId` with the
		// current editor page to disable pickers that no longer belong to this page.
		const isPageChanged =
			typeof postId === 'number' && !! currentPostId && postId !== currentPostId;
		const isMessageCurrent = typeof isCurrent === 'boolean' ? isCurrent : forceCurrent;
		const isStale = ! isLastMessage || ! isMessageCurrent || isPageChanged;

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
						...componentProps,
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
	};

	return messages.flatMap( ( message, index, array ) => {
		const firstContentText = message.content?.[ 0 ]?.text;

		// @ts-expect-error -- `assistant` comes from Big Sky messages
		if ( ( message.role !== 'agent' && message.role !== 'assistant' ) || ! firstContentText ) {
			const toolCall = getShowComponentToolCall( message );
			if ( toolCall ) {
				if (
					hasLaterToolResult( array, index, toolCall.toolCallId ) ||
					hasLaterShowComponentMessage( array, index )
				) {
					return [];
				}

				return renderShowComponentMessage(
					message,
					index,
					array,
					toolCall.toolId,
					toolCall.data,
					true
				);
			}

			const toolResultCallId = getToolResultCallId( message );
			if ( toolResultCallId && ! hasLaterShowComponentMessage( array, index ) ) {
				const previousToolCall = findPreviousShowComponentToolCall(
					array,
					index,
					toolResultCallId
				);
				if ( previousToolCall ) {
					return renderShowComponentMessage(
						message,
						index,
						array,
						previousToolCall.toolId,
						previousToolCall.data,
						true
					);
				}
			}

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
			if ( typeof textData.data !== 'object' || textData.data === null ) {
				return [];
			}

			if (
				hasLaterMatchingShowComponentToolResult(
					array,
					index,
					textData.tool_id,
					textData.data as Record< string, unknown >
				) ||
				hasLaterMatchingShowComponentMessage(
					array,
					index,
					textData.tool_id,
					textData.data as Record< string, unknown >
				)
			) {
				return [];
			}

			return renderShowComponentMessage(
				message,
				index,
				array,
				textData.tool_id,
				textData.data as Record< string, unknown >
			);
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
