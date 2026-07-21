import { EscalationButton } from '../components/escalation-button';
import UnavailableToolMessage from '../components/unavailable-tool-message';
import { isEditorPage } from './is-editor-page';
import { isShowComponentTool } from './show-component-tools';
import { getDisplayMessageFromToolData, isDisplayableToolMessageTool } from './tool-message-utils';
import type { GetChatComponent } from './load-external-providers';
import type { UIMessage } from '@automattic/agenttic-client';

export interface AgentsManagerUIMessage extends UIMessage {
	disabled?: boolean;
	traceId?: string;
	/** Suppress Agenttic's transient thinking indicator while this message is the latest one. */
	suppressThinking?: boolean;
}

interface Options {
	messages: UIMessage[];
	getChatComponent?: GetChatComponent;
	currentPostId?: number | string;
}

interface MessageWithContextFlags extends UIMessage {
	context?: {
		flags?: {
			context_only?: boolean;
		};
	};
}

function isContextOnlyMessage( message: UIMessage ): boolean {
	return (
		( message as MessageWithContextFlags ).context?.flags?.context_only === true ||
		message.content?.some( ( content ) => {
			if ( content.type === 'context' ) {
				return true;
			}

			const flags =
				content.type === 'data' ? ( content.data?.flags as { context_only?: boolean } ) : undefined;
			return flags?.context_only === true;
		} )
	);
}

function getShowComponentSummary( message: UIMessage ): string | undefined {
	const firstText = message.content?.[ 0 ]?.text;
	if ( ! firstText ) {
		return undefined;
	}

	try {
		const parsed = JSON.parse( firstText );
		if ( ! isShowComponentTool( parsed?.tool_id ) ) {
			return undefined;
		}

		const summary = parsed?.data?.summary;
		return typeof summary === 'string' ? summary.trim() || undefined : undefined;
	} catch ( _error ) {
		return undefined;
	}
}

function hasAgentRole( message: UIMessage ): boolean {
	const role = message.role as string;
	return role === 'agent' || role === 'assistant';
}

function isUnsuccessfulToolData( data: unknown ): boolean {
	return (
		typeof data === 'object' && data !== null && ( data as { success?: unknown } ).success === false
	);
}

function isDuplicateAdjacentShowComponentSummary(
	message: UIMessage,
	messages: UIMessage[],
	index: number
): boolean {
	const text = message.content?.[ 0 ]?.text?.trim();
	if ( ! text ) {
		return false;
	}

	const adjacentMessages = [ messages[ index - 1 ], messages[ index + 1 ] ].filter( Boolean );
	return adjacentMessages.some(
		( adjacentMessage ) => getShowComponentSummary( adjacentMessage ) === text
	);
}

/**
 * Converts tool-related messages to component messages.
 */
function hasLaterAgentToolMessageInSameTurn(
	messages: UIMessage[],
	currentIndex: number
): boolean {
	for ( const laterMessage of messages.slice( currentIndex + 1 ) ) {
		if ( laterMessage.role === 'user' ) {
			return false;
		}

		if ( ! hasAgentRole( laterMessage ) ) {
			continue;
		}

		const laterText = laterMessage.content?.[ 0 ]?.text;
		if ( ! laterText ) {
			continue;
		}

		try {
			const laterData = JSON.parse( laterText );
			if ( typeof laterData?.tool_id === 'string' ) {
				return true;
			}
		} catch ( _error ) {}
	}

	return false;
}

export default function convertToolMessagesToComponents( {
	messages,
	getChatComponent,
	currentPostId,
}: Options ): AgentsManagerUIMessage[] {
	return messages.flatMap( ( message, index, array ) => {
		if ( isContextOnlyMessage( message ) ) {
			return [];
		}

		const firstContentText = message.content?.[ 0 ]?.text;

		if ( ! hasAgentRole( message ) || ! firstContentText ) {
			return [ message ];
		}

		if ( isDuplicateAdjacentShowComponentSummary( message, array, index ) ) {
			return [];
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
						component: EscalationButton as React.ComponentType,
						componentProps: {
							messageId: message.id,
						},
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

		if (
			typeof textData !== 'object' ||
			textData === null ||
			typeof textData.tool_id !== 'string'
		) {
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

			const summaryText = typeof summary === 'string' ? summary.trim() || undefined : undefined;

			// A picker only stays interactive until the user replies past it — after
			// that it documents a previous step. Hidden context messages (e.g.
			// navigation continuations) are not real replies.
			const hasUserReplied = array
				.slice( index + 1 )
				.some(
					( laterMessage ) => laterMessage.role === 'user' && ! isContextOnlyMessage( laterMessage )
				);

			// In the site editor, React-Query caching keeps past conversations alive when the
			// user navigates to a different page. Compare the picker's `postId` with the
			// current editor page to disable pickers that no longer belong to this page.
			const isPageChanged =
				!! postId && !! currentPostId && String( postId ) !== String( currentPostId );
			const isStale = hasUserReplied || ! isCurrent || isPageChanged;

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
				suppressThinking: followUpTasks !== true,
			};

			return [ componentMessage ];
		}

		// Handle agent-facing Big Sky tool result summaries.
		if ( isDisplayableToolMessageTool( textData.tool_id ) ) {
			if ( isUnsuccessfulToolData( textData.data ) ) {
				return [];
			}

			const summary = getDisplayMessageFromToolData( textData.data );
			if ( ! summary ) {
				return [];
			}

			// Tool summaries with follow-up tasks are intermediate status updates. When
			// rehydrating history, a later tool message in the same user turn (for example,
			// a color picker) should be the visible response instead of replaying this
			// intermediate confirmation.
			if (
				( textData.data as { followUpTasks?: unknown } )?.followUpTasks === true &&
				hasLaterAgentToolMessageInSameTurn( array, index )
			) {
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
