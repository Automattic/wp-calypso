import { useCallback } from 'react';
import { useAgentUIContext } from '../../context/AgentUIContext';
import { Suggestions } from '../chat/Suggestions';

export interface AgentUISuggestionsProps {
	className?: string;
	showSuggestions?: boolean;
	onSelect?: ( message: string ) => void;
}

export function AgentUISuggestions( {
	className,
	showSuggestions,
	onSelect,
}: AgentUISuggestionsProps = {} ) {
	const { suggestions, handleSuggestionSubmit, inputValue } =
		useAgentUIContext();

	const handleSubmit = useCallback(
		( message: string ) => {
			try {
				onSelect?.( message );
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.warn( 'Suggestions onSelect callback failed:', error );
			}
			handleSuggestionSubmit( message );
		},
		[ onSelect, handleSuggestionSubmit ]
	);

	// Only show when input is empty or showSuggestions is true.
	if ( inputValue && ! showSuggestions ) {
		return null;
	}

	return (
		<Suggestions
			suggestions={ suggestions }
			onSubmit={ handleSubmit }
			className={ className }
		/>
	);
}
