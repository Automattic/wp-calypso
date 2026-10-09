import A2UI from './a2ui';
import { getA2uiMessagesFromText } from './a2ui-messages';
import type { A2uiPresentation } from './use-a2ui';
import type { AgentsManagerUIMessage } from '../utils/convert-tool-messages-to-components';
import type { ComponentType } from 'react';

export default function convertA2uiMessagesToComponents(
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
				if ( ! getA2uiMessagesFromText( content.text ) ) {
					return [ content ];
				}
				if ( rendered ) {
					return [];
				}
				rendered = true;
				return [
					{
						type: 'component' as const,
						component: A2UI as ComponentType,
						componentProps: { messageId: message.id },
					},
				];
			} ),
		};
	} );
}

export function attachA2uiPresentation(
	messages: AgentsManagerUIMessage[],
	presentation: A2uiPresentation
): AgentsManagerUIMessage[] {
	return messages.map( ( message ) => ( {
		...message,
		content: message.content.map( ( content ) =>
			content.type === 'component' && content.component === A2UI
				? { ...content, componentProps: { ...content.componentProps, presentation } }
				: content
		),
	} ) );
}
