import { AgentUIProvider, Suggestions, useAgentUIContext } from '@automattic/agenttic-ui';
import { getEditorEmptyViewSuggestions } from '../../utils/editor-suggestions';

/**
 * AM's editor empty-view suggestions as a list under a message, which a
 * provider asks for to offer next steps (Big Sky does after a site build).
 * Clicks go through Agenttic, like any other suggestion.
 */
export default function EditorEmptyViewSuggestions() {
	const context = useAgentUIContext();

	return (
		// Unlike the chips, the list sits in the transcript: it shows every
		// suggestion even when floating, and stays out of the chips' rendered tracking.
		<AgentUIProvider
			value={ { ...context, variant: 'embedded', reportSuggestionsRendered: undefined } }
		>
			<Suggestions
				layout="vertical"
				translateY={ 0 }
				suggestions={ getEditorEmptyViewSuggestions() }
				onSubmit={ context.handleSuggestionSubmit }
			/>
		</AgentUIProvider>
	);
}
