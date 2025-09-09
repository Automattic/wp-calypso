import React from 'react';
import { useAgentUIContext } from '../../context/AgentUIContext';
import { Suggestions } from '../chat/Suggestions';

export interface AgentUISuggestionsProps {
	className?: string;
	showSuggestions?: boolean;
}

export function AgentUISuggestions( {
	className,
	showSuggestions,
}: AgentUISuggestionsProps = {} ) {
	const { suggestions, handleSuggestionSubmit, inputValue } =
		useAgentUIContext();

	// Only show when input is empty or showSuggestions is true.
	if ( inputValue && ! showSuggestions ) {
		return null;
	}

	return (
		<Suggestions
			suggestions={ suggestions }
			onSubmit={ handleSuggestionSubmit }
			className={ className }
		/>
	);
}
