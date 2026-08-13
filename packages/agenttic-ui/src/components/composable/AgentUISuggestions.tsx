import { useCallback } from 'react';
import { useAgentUIContext } from '../../context/AgentUIContext';
import { Suggestions } from '../chat/Suggestions';
import type { Suggestion } from '../../types';

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
	const {
		suggestions,
		handleSuggestionSubmit,
		inputValue,
		messages,
		variant,
		emptyView,
	} = useAgentUIContext();

	const handleSubmit = useCallback(
		(
			selectedSuggestion: Suggestion,
			availableSuggestions: Suggestion[]
		) => {
			try {
				const value =
					selectedSuggestion.prompt ?? selectedSuggestion.label;
				onSelect?.( value );
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.warn( 'Suggestions onSelect callback failed:', error );
			}
			handleSuggestionSubmit( selectedSuggestion, availableSuggestions );
		},
		[ onSelect, handleSuggestionSubmit ]
	);

	// Only show when input is empty or showSuggestions is true.
	if ( inputValue && ! showSuggestions ) {
		return null;
	}

	// Hide suggestions when emptyView is being shown
	if (
		emptyView &&
		[ 'floating', 'embedded' ].includes( variant ) &&
		messages.length === 0 &&
		! inputValue
	) {
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
