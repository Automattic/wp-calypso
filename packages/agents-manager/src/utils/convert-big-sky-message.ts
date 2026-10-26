import lazyComponent from './lazy-component';
import type { BigSkyMessage } from '../types';
import type { UIMessage } from '@automattic/agenttic-client';

// Carries the suggestion copy, so it loads only when a message asks for it.
const EditorEmptyViewSuggestions = lazyComponent(
	() =>
		import(
			/* webpackChunkName: "am-editor-empty-view-suggestions" */ '../components/editor-empty-view-suggestions'
		)
);

/** Converts a message a provider adds through `addMessage` to Agenttic's format. */
export function convertBigSkyMessageToUIMessage( message: BigSkyMessage ): UIMessage {
	const suggestionList = {
		type: 'component' as const,
		component: EditorEmptyViewSuggestions,
		componentProps: { messageId: message.id },
	};

	const content = message.hasEditorEmptyViewSuggestions
		? [ ...message.content, suggestionList ]
		: message.content;

	return {
		// Spread first to keep fields `BigSkyMessage` doesn't declare, e.g. the
		// `context` the site build reads to show its progress indicator.
		...message,
		content,
		role: message.role === 'assistant' ? 'agent' : 'user',
		timestamp: message.created_at ? message.created_at * 1000 : Date.now(),
		archived: message.archived ?? false,
		showIcon: message.showIcon ?? true,
	} as UIMessage;
}
