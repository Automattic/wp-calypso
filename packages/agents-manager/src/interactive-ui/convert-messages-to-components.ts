import { withDisabledActions } from '../utils/message-actions';
import { InteractiveUiActionNote } from './action-note';
import { readInteractiveUiActionMessage, readInteractiveUiPart } from './messages';
import { InteractiveUiSurfaces } from './surfaces';
import type { InteractiveUiPresentation } from './use-interactive-ui';
import type { AgentsManagerUIMessage } from '../utils/convert-tool-messages-to-components';
import type { UIMessage } from '@automattic/agenttic-client';
import type { ComponentType } from 'react';

/**
 * Replaces the interactive UI parts of each agent message with one `InteractiveUiSurfaces` part,
 * which renders all of the message's surfaces under its text.
 */
export function convertInteractiveUiMessagesToComponents(
	messages: AgentsManagerUIMessage[]
): AgentsManagerUIMessage[] {
	return messages.map( ( message ) => {
		if ( message.role !== 'agent' ) {
			return message;
		}

		let hasSurfacesPart = false;

		return {
			...message,
			content: message.content.flatMap( ( content ) => {
				if ( ! readInteractiveUiPart( content ) ) {
					return [ content ];
				}

				if ( hasSurfacesPart ) {
					return [];
				}

				hasSurfacesPart = true;

				return [
					{
						type: 'component' as const,
						component: InteractiveUiSurfaces as ComponentType,
						componentProps: { messageId: message.id },
					},
				];
			} ),
		};
	} );
}

type MessageContentPart = AgentsManagerUIMessage[ 'content' ][ number ];

function isInteractiveUiSurfacesPart( content: MessageContentPart ) {
	return content.type === 'component' && content.component === InteractiveUiSurfaces;
}

/**
 * Hands each message's interactive UI part the current presentation, and drops the part while
 * its message has no surface to show yet, unless the renderer failed to load or the runtime
 * rejected some of the message's A2UI messages, so the part shows a retry or a notice. Stale
 * surfaces disable their own inputs and actions, and a message whose surfaces are all stale
 * disables its actions too. Unlike a stale `show-component` message, it isn't greyed out.
 */
export function attachInteractiveUiPresentation(
	messages: AgentsManagerUIMessage[],
	presentation: InteractiveUiPresentation
): AgentsManagerUIMessage[] {
	return messages.map( ( message ) => {
		if ( ! message.content.some( isInteractiveUiSurfacesPart ) ) {
			return message;
		}

		const surfaceIds = presentation.runtime?.getSurfaceIds( message.id ) ?? [];
		const hasSurfaces = surfaceIds.length > 0;
		const isStale =
			hasSurfaces &&
			surfaceIds.every( ( surfaceId ) => presentation.staleSurfaceIds.has( surfaceId ) );

		const attachedMessage = {
			...message,
			content: message.content.flatMap( ( content ) => {
				if ( ! isInteractiveUiSurfacesPart( content ) ) {
					return [ content ];
				}

				if (
					! hasSurfaces &&
					! presentation.hasLoadError &&
					! presentation.rejectedMessageIds.has( message.id )
				) {
					return [];
				}

				return [
					{
						...content,
						componentProps: { ...content.componentProps, presentation },
					},
				];
			} ),
		};

		return isStale ? withDisabledActions( attachedMessage ) : attachedMessage;
	} );
}

// Agenttic hides a message with only context or data parts, as `getVisibleMessages()` does.
function isShownByAgenttic( message: AgentsManagerUIMessage ) {
	return message.content.some(
		( content ) => content.type !== 'context' && content.type !== 'data'
	);
}

// A display-only message on the user's side, so the action's own stays hidden context for
// staleness, checkpoints and the latest user message.
function createActionNote( message: UIMessage, userMessage: string ): AgentsManagerUIMessage {
	return {
		id: `${ message.id }-note`,
		role: 'user',
		content: [
			{
				type: 'component',
				component: InteractiveUiActionNote as ComponentType,
				componentProps: { userMessage },
			},
		],
		timestamp: message.timestamp,
		archived: false,
		showIcon: false,
	};
}

/**
 * Shows the interactive UI actions, whose messages are hidden: an action's `userMessage` as a note
 * on the user's side before its reply. Without a note, the reply starts the turn, since Agenttic
 * would otherwise treat it as part of the turn before it.
 */
export function presentInteractiveUiActions(
	displayedMessages: AgentsManagerUIMessage[],
	messages: UIMessage[]
): AgentsManagerUIMessage[] {
	const displayedMessageIds = new Set( displayedMessages.map( ( message ) => message.id ) );
	const shownMessageIds = new Set(
		displayedMessages.filter( isShownByAgenttic ).map( ( message ) => message.id )
	);

	const notesByNextMessageId = new Map< string, AgentsManagerUIMessage[] >();
	const replyIds = new Set< string >();
	let pendingNotes: AgentsManagerUIMessage[] = [];
	let isAwaitingReply = false;

	for ( const message of messages ) {
		const action = readInteractiveUiActionMessage( message );

		if ( action ) {
			if ( action.userMessage ) {
				pendingNotes.push( createActionNote( message, action.userMessage ) );
			}

			isAwaitingReply = true;
			continue;
		}

		// Notes go before the reply even while it's hidden, so Agenttic sees that reply last.
		if ( pendingNotes.length > 0 && displayedMessageIds.has( message.id ) ) {
			notesByNextMessageId.set( message.id, pendingNotes );
			pendingNotes = [];
			isAwaitingReply = false;
		}

		if ( ! shownMessageIds.has( message.id ) ) {
			continue;
		}

		if ( isAwaitingReply && message.role === 'agent' ) {
			replyIds.add( message.id );
		}

		isAwaitingReply = false;
	}

	if ( notesByNextMessageId.size === 0 && replyIds.size === 0 && pendingNotes.length === 0 ) {
		return displayedMessages;
	}

	// A note shows last only while no message after its action exists yet.
	return [
		...displayedMessages.flatMap( ( message ) => [
			...( notesByNextMessageId.get( message.id ) ?? [] ),
			replyIds.has( message.id ) ? { ...message, startsTurn: true } : message,
		] ),
		...pendingNotes,
	];
}
