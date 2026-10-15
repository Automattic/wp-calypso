import InteractiveUi from './interactive-ui';
import { getInteractiveUiMessagesFromText } from './interactive-ui-messages';
import type { InteractiveUiPresentation } from './use-interactive-ui';
import type { AgentsManagerUIMessage } from '../utils/convert-tool-messages-to-components';
import type { ComponentType } from 'react';

export default function convertInteractiveUiMessagesToComponents(
	messages: AgentsManagerUIMessage[]
): AgentsManagerUIMessage[] {
	return messages.map( ( message ) => {
		if ( message.role !== 'agent' ) {
			return message;
		}
		let rendered = false;
		return {
			...message,
			content: ( message.content ?? [] ).flatMap( ( content ) => {
				if ( content.type !== 'text' || ! getInteractiveUiMessagesFromText( content.text ) ) {
					return [ content ];
				}
				if ( rendered ) {
					return [];
				}
				rendered = true;
				return [
					{
						type: 'component' as const,
						component: InteractiveUi as ComponentType,
						componentProps: { messageId: message.id },
					},
				];
			} ),
		};
	} );
}

export function attachInteractiveUiPresentation(
	messages: AgentsManagerUIMessage[],
	presentation: InteractiveUiPresentation
): AgentsManagerUIMessage[] {
	return messages.map( ( message ) => ( {
		...message,
		content: message.content
			.filter(
				( content ) =>
					content.type !== 'component' ||
					content.component !== InteractiveUi ||
					presentation.hasLoadError ||
					presentation.runtime?.getSurfaceIds( message.id ).length
			)
			.map( ( content ) =>
				content.type === 'component' && content.component === InteractiveUi
					? { ...content, componentProps: { ...content.componentProps, presentation } }
					: content
			),
	} ) );
}
