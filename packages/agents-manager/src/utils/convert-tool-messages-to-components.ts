import { __ } from '@wordpress/i18n';
import ChatResponseRenderedTracker, {
	createChatResponseActionCallback,
} from '../components/chat-response-tracking';
import { EscalationButton } from '../components/escalation-button';
import OpenHelpCenterButton from '../components/open-help-center-button';
import { ButtonPicker, ColorPicker, FontPicker } from '../components/style-pickers';
import { isContextOnlyMessage } from './context-only-message';
import { getLatestUserMessageIndex } from './latest-message';
import { isShowComponentTool } from './show-component-tools';
import { isChatUiStale } from './stale-chat-ui';
import {
	APPLY_BLOCK_EDITS_TOOL_ID,
	getApplyBlockEditsOutcome,
	getDisplayMessageFromToolData,
	getToolMessageData,
	isBlockEditToolId,
	isDisplayableToolMessageTool,
	isVisualCheckPending,
	parseToolMessageText,
} from './tool-message-utils';
import type { GetChatComponent } from './load-external-providers';
import type { OPEN_HELP_CENTER_BUTTON_TYPE } from '../abilities/open-help-center';
import type { ShowComponentType } from '../abilities/show-component';
import type { UIMessage } from '@automattic/agenttic-client';

export interface AgentsManagerUIMessage extends UIMessage {
	disabled?: boolean;
	traceId?: string;
	/** Suppress Agenttic's transient thinking indicator while this message is the latest one. */
	suppressThinking?: boolean;
	/** Starts a turn though no user message shows before it, as a reply to an interactive UI action. */
	startsTurn?: boolean;
}

type AmComponentType = ShowComponentType | typeof OPEN_HELP_CENTER_BUTTON_TYPE;

// AM-owned components by type. These take precedence over provider
// components — AM is the single source of truth for each of these types.
// The pickers load on demand; the Help Center button ships inline.
const AM_COMPONENTS: Record< AmComponentType, React.ComponentType > = {
	'button-picker': ButtonPicker,
	'color-picker': ColorPicker,
	'font-picker': FontPicker,
	'open-help-center-button': OpenHelpCenterButton,
};

function getAmComponent( type: string ): React.ComponentType | null {
	// Own-property check so degenerate types (e.g. `toString`) can't resolve
	// to `Object.prototype` members.
	return Object.hasOwn( AM_COMPONENTS, type ) ? AM_COMPONENTS[ type as AmComponentType ] : null;
}

interface Options {
	messages: UIMessage[];
	getChatComponent?: GetChatComponent;
	currentPostId?: number | string;
	/** Whether the agent's turn is still running, so a promised check may still land. */
	isProcessing?: boolean;
	canEscalateToHuman?: boolean;
	/** Block-edit tool calls the server has replaced with a retry. */
	retriedToolCallIds?: ReadonlySet< string >;
}

function getShowComponentSummary( message: UIMessage ): string | undefined {
	const toolData = getToolMessageData( message );
	if ( ! isShowComponentTool( toolData?.toolId ) ) {
		return undefined;
	}

	const summary = toolData?.summary;
	return typeof summary === 'string' ? summary.trim() || undefined : undefined;
}

function isBlockEditToolMessage( message: UIMessage ): boolean {
	return hasAgentRole( message ) && isBlockEditToolId( getToolMessageData( message )?.toolId );
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

		if ( typeof getToolMessageData( laterMessage )?.toolId === 'string' ) {
			return true;
		}
	}

	return false;
}

function hasLaterApplyBlockEditsOutcome(
	messages: UIMessage[],
	currentIndex: number,
	toolCallId: string
): boolean {
	for ( const laterMessage of messages.slice( currentIndex + 1 ) ) {
		if ( laterMessage.role === 'user' ) {
			return false;
		}

		const laterText = laterMessage.content?.[ 0 ]?.text;
		if ( ! hasAgentRole( laterMessage ) || ! laterText ) {
			continue;
		}

		try {
			const laterData = JSON.parse( laterText );
			if (
				laterData?.tool_call_id === toolCallId &&
				getApplyBlockEditsOutcome( laterData.tool_id, laterData.data )
			) {
				return true;
			}
		} catch ( _error ) {}
	}

	return false;
}

/**
 * Whether the deferred reply for a promised visual check is still outstanding.
 *
 * The reply is plain agent prose following the tool result, so the wait lasts
 * only while nothing follows this message. It ends two ways: the prose arrives,
 * or the turn ends without it. Either way the summary comes back, which is what
 * a flag that over-promises — the per-turn look budget the ability cannot see —
 * falls back to, with no timer and no stale state in rehydrated history.
 */
function isAwaitingVisualCheckReply( messages: UIMessage[], currentIndex: number ): boolean {
	for ( const laterMessage of messages.slice( currentIndex + 1 ) ) {
		if ( laterMessage.role === 'user' ) {
			return false;
		}

		const laterText = laterMessage.content?.[ 0 ]?.text?.trim();
		if ( ! hasAgentRole( laterMessage ) || ! laterText || isContextOnlyMessage( laterMessage ) ) {
			continue;
		}

		if ( typeof parseToolMessageText( laterText )?.toolId === 'string' ) {
			continue;
		}

		return false;
	}

	return true;
}

function followsTerminalApplyBlockEditsOutcome(
	messages: UIMessage[],
	currentIndex: number
): boolean {
	for ( let index = currentIndex - 1; index >= 0; index-- ) {
		const earlierMessage = messages[ index ];
		if ( earlierMessage.role === 'user' ) {
			return false;
		}

		const earlierText = earlierMessage.content?.[ 0 ]?.text;
		if ( ! hasAgentRole( earlierMessage ) || ! earlierText ) {
			continue;
		}

		try {
			const earlierData = JSON.parse( earlierText );
			if ( typeof earlierData?.tool_id !== 'string' ) {
				continue;
			}

			// A promised visual check makes the following prose the deferred reply
			// rather than redundant narration, so it has to survive. Suppressing it
			// alongside the withheld summary would leave the turn with nothing.
			return (
				!! getApplyBlockEditsOutcome( earlierData.tool_id, earlierData.data ) &&
				earlierData.data?.followUpTasks !== true &&
				! isVisualCheckPending( earlierData.tool_id, earlierData.data )
			);
		} catch ( _error ) {
			return false;
		}
	}

	return false;
}

function hasToolSummaryFlag( message: UIMessage ): boolean {
	return message.content.some(
		( content ) =>
			content.type === 'data' &&
			( content.data?.flags as { tool_summary?: unknown } | undefined )?.tool_summary === true
	);
}

/**
 * Whether to show a hidden ack that repeats a tool's summary (`tool_summary`). A reloaded chat has
 * no tool messages, so it shows when its turn has none.
 */
function isRestoredToolSummary( messages: UIMessage[], currentIndex: number ): boolean {
	if ( ! hasToolSummaryFlag( messages[ currentIndex ] ) ) {
		return false;
	}

	for ( let index = currentIndex - 1; index >= 0; index-- ) {
		const earlierMessage = messages[ index ];
		if ( earlierMessage.role === 'user' && ! isContextOnlyMessage( earlierMessage ) ) {
			return true;
		}

		if (
			hasAgentRole( earlierMessage ) &&
			typeof getToolMessageData( earlierMessage )?.toolId === 'string'
		) {
			return false;
		}
	}

	return true;
}

function withContextAsText( message: UIMessage ): UIMessage {
	return {
		...message,
		content: message.content.map( ( content ) =>
			content.type === 'context' ? { ...content, type: 'text' } : content
		),
	};
}

/**
 * Drops a message's narration after a terminal block-edit outcome, but keeps a component beside it,
 * such as an interactive UI surface.
 */
function withoutNarration( message: UIMessage ): UIMessage[] {
	const content = message.content.filter( ( part ) => part.type === 'component' );

	return content.length > 0 ? [ { ...message, content } ] : [];
}

/**
 * Converts tool-related messages to component messages.
 */
export default function convertToolMessagesToComponents( {
	messages,
	getChatComponent,
	currentPostId,
	isProcessing,
	canEscalateToHuman = true,
	retriedToolCallIds,
}: Options ): AgentsManagerUIMessage[] {
	const latestUserMessageIndex = getLatestUserMessageIndex( messages );

	const convertMessage = (
		message: UIMessage,
		index: number,
		array: UIMessage[]
	): AgentsManagerUIMessage | AgentsManagerUIMessage[] => {
		if ( isContextOnlyMessage( message ) ) {
			return isRestoredToolSummary( array, index ) ? [ withContextAsText( message ) ] : [];
		}

		const firstContentText = message.content?.[ 0 ]?.text;

		if ( ! hasAgentRole( message ) || ! firstContentText ) {
			return [ message ];
		}

		if ( isDuplicateAdjacentShowComponentSummary( message, array, index ) ) {
			return [];
		}

		// The user asked for human support
		const forwardToHumanSupportContent = message.content.find(
			( content ) =>
				content.type === 'data' &&
				content.data?.flags &&
				typeof content.data.flags === 'object' &&
				'forward_to_human_support' in content.data.flags
		);
		if ( forwardToHumanSupportContent ) {
			if ( ! canEscalateToHuman ) {
				return {
					...message,
					content: message.content.filter(
						( content ) => content !== forwardToHumanSupportContent
					),
				};
			}

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
			return followsTerminalApplyBlockEditsOutcome( array, index )
				? withoutNarration( message )
				: [ message ];
		}

		if (
			typeof textData !== 'object' ||
			textData === null ||
			typeof textData.tool_id !== 'string'
		) {
			return followsTerminalApplyBlockEditsOutcome( array, index )
				? withoutNarration( message )
				: [ message ];
		}

		// Handle `show-component` tool message
		if ( isShowComponentTool( textData.tool_id ) ) {
			const toolData = textData.data ?? {};
			const {
				type: contentType,
				props,
				followUpTasks,
				isCurrent,
				postId,
				summary,
				responseTrackingProperties,
			} = toolData;
			const toolCallId =
				typeof textData.tool_call_id === 'string' && textData.tool_call_id
					? textData.tool_call_id
					: undefined;
			const amComponent = getAmComponent( contentType );
			// AM components take precedence; other types resolve through the external
			// providers (e.g. jetpack-ai-sidebar's title pickers) via `getChatComponent`.
			const Component = amComponent ?? getChatComponent?.( contentType );
			// Provider components resolve by `contentType`; AM components are pre-resolved.
			const ownerProps = amComponent ? {} : { contentType };

			const summaryText = typeof summary === 'string' ? summary.trim() || undefined : undefined;

			// No matching component on either side (e.g. a deprecated type in
			// restored history) — show the stored summary or a short notice
			// instead of raw JSON.
			if ( ! Component ) {
				return [
					{
						...message,
						content: [
							{
								type: 'text' as const,
								text:
									summaryText ?? __( 'This option is no longer available.', __i18n_text_domain__ ),
							},
						],
						suppressThinking: true,
					},
				];
			}

			// History rows carry no `isCurrent`, so a restored picker is stale too.
			const isStale =
				! isCurrent ||
				isChatUiStale( {
					messageIndex: index,
					latestUserMessageIndex,
					postId,
					currentPostId,
				} );
			const shouldTrackResponse = ! isStale;
			let responseActionProps = {};
			if ( ! amComponent ) {
				responseActionProps = {
					onResponseAction: shouldTrackResponse
						? createChatResponseActionCallback( {
								componentType: contentType,
								toolId: textData.tool_id,
								...( toolCallId ? { toolCallId } : {} ),
							} )
						: undefined,
				};
			}

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
							...ownerProps,
							...( toolCallId ? { toolCallId } : {} ),
							...responseActionProps,
							...( isStale && { isMessageStale: true } ),
						},
					},
					...( shouldTrackResponse
						? [
								{
									type: 'component' as const,
									component: ChatResponseRenderedTracker as React.ComponentType,
									componentProps: {
										componentType: contentType,
										toolId: textData.tool_id,
										...( toolCallId ? { toolCallId } : {} ),
										...( responseTrackingProperties ? { responseTrackingProperties } : {} ),
									},
								},
							]
						: [] ),
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

			const blockEditOutcome = getApplyBlockEditsOutcome( textData.tool_id, textData.data );
			const isLegacySuccessfulApplyBlockEditsResult =
				textData.tool_id === APPLY_BLOCK_EDITS_TOOL_ID && textData.data?.result?.success === true;

			if (
				isBlockEditToolId( textData.tool_id ) &&
				! blockEditOutcome &&
				! isLegacySuccessfulApplyBlockEditsResult
			) {
				return [];
			}

			// Retries are known only from the live stream: rehydrated history has no
			// `retryingToolCallId`, so after a reload a retried no-change reappears. A
			// later edit in the same turn is not proof of a retry, so none is inferred.
			if (
				isBlockEditToolId( textData.tool_id ) &&
				typeof textData.tool_call_id === 'string' &&
				retriedToolCallIds?.has( textData.tool_call_id )
			) {
				return [];
			}

			// The server may answer a no-change with a retry, which would hide the
			// summary again; withhold it until the turn ends so it never flashes.
			const isInLatestTurn = latestUserMessageIndex <= index;
			if ( isProcessing && blockEditOutcome === 'no-changes' && isInLatestTurn ) {
				return [];
			}

			const summary = getDisplayMessageFromToolData( textData.data );
			if ( ! summary && blockEditOutcome !== 'no-changes' ) {
				return [];
			}

			if (
				typeof textData.tool_call_id === 'string' &&
				hasLaterApplyBlockEditsOutcome( array, index, textData.tool_call_id )
			) {
				return [];
			}

			// While a promised check is still running, the transient thinking indicator
			// already reads as the agent working, so the summary is withheld rather than
			// replaced by a second, static one. The summary returns as soon as any
			// of the three ends the wait — the reply lands, the turn ends, or the stream
			// stops — so a flag that over-promises cannot swallow the edit.
			if (
				isProcessing &&
				isVisualCheckPending( textData.tool_id, textData.data ) &&
				isAwaitingVisualCheckReply( array, index )
			) {
				return [];
			}

			const content =
				blockEditOutcome === 'no-changes'
					? [
							{
								type: 'text' as const,
								text: __( '✓ No changes needed', __i18n_text_domain__ ),
							},
						]
					: [
							{
								type: 'text' as const,
								text: summary as string,
							},
						];

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
					// Block edits always return to the agent, which keeps working after the
					// summary (often on further edits), so the indicator must stay visible.
					suppressThinking: ! isBlockEditToolId( textData.tool_id ),
					content,
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

		// Remove unhandled tool messages to avoid displaying raw JSON to the user.
		// eslint-disable-next-line no-console
		console.warn( `[AgentsManager] Unhandled tool message with tool_id: ${ textData.tool_id }` );
		return [];
	};

	const converted: AgentsManagerUIMessage[] = [];
	// A block edit always returns to the agent, so one that renders nothing (a
	// retried or withheld outcome, a failure, a pending check) still means the
	// agent is working.
	let hasHiddenBlockEditSinceLatest = false;
	messages.forEach( ( message, index, array ) => {
		const result = [ convertMessage( message, index, array ) ].flat();
		if ( result.length > 0 ) {
			converted.push( ...result );
			hasHiddenBlockEditSinceLatest = false;
		} else if ( isBlockEditToolMessage( message ) ) {
			hasHiddenBlockEditSinceLatest = true;
		}
	} );

	// Without this, an earlier message (e.g. a logo summary) would become the
	// latest one and its `suppressThinking` would hide the indicator, and the
	// retry progress with it, while the turn is still running.
	const latest = converted[ converted.length - 1 ];
	if ( isProcessing && hasHiddenBlockEditSinceLatest && latest?.suppressThinking ) {
		converted[ converted.length - 1 ] = { ...latest, suppressThinking: false };
	}

	return converted;
}
