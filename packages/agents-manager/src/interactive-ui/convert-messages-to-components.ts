import { withDisabledActions } from '../utils/message-actions';
import { isInteractiveUiActionMessage, parseInteractiveUiText } from './messages';
import { InteractiveUiSurfaces } from './surfaces';
import type { InteractiveUiPresentation } from './use-interactive-ui';
import type { AgentsManagerUIMessage } from '../utils/convert-tool-messages-to-components';
import type { UIMessage } from '@automattic/agenttic-client';
import type { ComponentType } from 'react';

/**
 * Replaces the interactive UI text parts of each agent message with one
 * `InteractiveUiSurfaces` part, which renders all of the message's surfaces.
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
				if ( content.type !== 'text' || ! parseInteractiveUiText( content.text ) ) {
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
 * its message has no surface to show yet, unless the renderer failed to load. Stale surfaces
 * disable their own controls, so a message whose surfaces are all stale keeps its look and only
 * disables its actions, as a `show-component` message does.
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

				if ( ! hasSurfaces && ! presentation.hasLoadError ) {
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

/**
 * Starts a turn at each reply to an interactive UI action. The action's message is hidden, so
 * Agenttic would otherwise treat the reply as part of the turn before it.
 */
export function markInteractiveUiActionReplies(
	displayedMessages: AgentsManagerUIMessage[],
	messages: UIMessage[]
): AgentsManagerUIMessage[] {
	const shownMessageIds = new Set(
		displayedMessages.filter( isShownByAgenttic ).map( ( message ) => message.id )
	);
	const replyIds = new Set< string >();
	let isAwaitingReply = false;

	for ( const message of messages ) {
		if ( isInteractiveUiActionMessage( message ) ) {
			isAwaitingReply = true;
			continue;
		}

		if ( ! shownMessageIds.has( message.id ) ) {
			continue;
		}

		if ( isAwaitingReply && message.role === 'agent' ) {
			replyIds.add( message.id );
		}

		isAwaitingReply = false;
	}

	if ( replyIds.size === 0 ) {
		return displayedMessages;
	}

	return displayedMessages.map( ( message ) =>
		replyIds.has( message.id ) ? { ...message, startsTurn: true } : message
	);
}
