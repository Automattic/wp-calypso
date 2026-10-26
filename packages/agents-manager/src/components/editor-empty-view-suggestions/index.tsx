import { AgentUIProvider, Suggestions, useAgentUIContext } from '@automattic/agenttic-ui';
import { getEditorEmptyViewSuggestions } from '../../utils/editor-suggestions';
import { getLatestUserMessageIndex } from '../../utils/latest-message';

interface EditorEmptyViewSuggestionsProps {
	/** The message the list sits under. */
	messageId?: string;
}

/**
 * AM's editor empty-view suggestions as a list under a message, which a
 * provider asks for to offer next steps (Big Sky does after a site build).
 * Clicks go through Agenttic, like any other suggestion. Like the empty view,
 * it goes away once the user replies.
 */
export default function EditorEmptyViewSuggestions( {
	messageId,
}: EditorEmptyViewSuggestionsProps ) {
	const context = useAgentUIContext();
	const messageIndex = context.messages.findIndex( ( message ) => message.id === messageId );
	const hasUserReplied = getLatestUserMessageIndex( context.messages ) > messageIndex;

	if ( hasUserReplied ) {
		return null;
	}

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
