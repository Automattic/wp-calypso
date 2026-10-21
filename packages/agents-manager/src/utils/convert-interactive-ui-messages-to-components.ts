import { InteractiveUiSurfaces } from '../components/interactive-ui-surfaces';
import { getInteractiveUiMessagesFromText } from './interactive-ui-messages';
import type { AgentsManagerUIMessage } from './convert-tool-messages-to-components';
import type { InteractiveUiPresentation } from '../hooks/use-interactive-ui';
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
				if ( content.type !== 'text' || ! getInteractiveUiMessagesFromText( content.text ) ) {
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
 * its message has no surface to show yet, unless the renderer failed to load.
 */
export function attachInteractiveUiPresentation(
	messages: AgentsManagerUIMessage[],
	presentation: InteractiveUiPresentation
): AgentsManagerUIMessage[] {
	return messages.map( ( message ) => {
		if ( ! message.content.some( isInteractiveUiSurfacesPart ) ) {
			return message;
		}

		const hasSurfaces = !! presentation.runtime?.getSurfaceIds( message.id ).length;

		return {
			...message,
			content: message.content.flatMap( ( content ) => {
				if ( ! isInteractiveUiSurfacesPart( content ) ) {
					return [ content ];
				}

				if ( ! hasSurfaces && ! presentation.hasLoadError ) {
					return [];
				}

				return [ { ...content, componentProps: { ...content.componentProps, presentation } } ];
			} ),
		};
	} );
}
