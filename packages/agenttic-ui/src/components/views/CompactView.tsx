import React, { useCallback, useEffect, useState } from 'react';
import type { Suggestion } from '../../types';
import { type ActionButton, ChatInput } from '../chat/ChatInput';
import { Suggestions } from '../chat/Suggestions';
import { useMultiTimeout } from '../../hooks/useMultiTimeout';

// Constants for better maintainability
const SUGGESTIONS_AUTO_HIDE_DELAY = 4000; // 4 seconds
const SUGGESTIONS_EXIT_ANIMATION_DURATION = 400; // Must match CSS transition

interface CompactViewProps {
	value: string;
	onChange: ( value: string ) => void;
	onSubmit: () => void;
	onKeyDown: ( e: React.KeyboardEvent< HTMLTextAreaElement > ) => void;
	textareaRef: React.RefObject< HTMLTextAreaElement >;
	placeholder?: string | string[];
	isProcessing: boolean;
	onBlur?: () => void;
	onExpand?: () => void;
	showExpandButton?: boolean;
	focusOnMount?: boolean;
	customActions?: ActionButton[];
	actionOrder?: 'before-submit' | 'after-submit';
	onStop?: () => void;
	suggestions?: Suggestion[];
	clearSuggestions?: () => void;
}

export function CompactView( {
	value,
	onChange,
	onSubmit,
	onKeyDown,
	textareaRef,
	placeholder,
	isProcessing,
	onBlur,
	onExpand,
	showExpandButton = true,
	focusOnMount = false,
	customActions,
	actionOrder,
	onStop,
	suggestions,
	clearSuggestions,
}: CompactViewProps ) {
	const [ suggestionsVisible, setSuggestionsVisible ] = useState( false );

	// Use our custom timeout hook for proper cleanup
	const { setNamedTimeout, clearAllTimeouts } = useMultiTimeout();

	const handleSuggestionSubmit = useCallback(
		( suggestionValue: string ) => {
			onChange( suggestionValue );
			clearSuggestions?.();
		},
		[ onChange, clearSuggestions ]
	);

	useEffect( () => {
		// Clear any existing timeouts when dependencies change
		clearAllTimeouts();

		// Case 1: User is typing - hide suggestions since they only show when input is empty
		if ( value ) {
			setSuggestionsVisible( false );
			return; // Early return - no timeouts needed
		}

		// Case 2: Input is empty but no suggestions - hide immediately
		if ( ! suggestions || suggestions.length === 0 ) {
			setSuggestionsVisible( false );
			return;
		}

		// Case 3: Input empty + suggestions available - show with auto-hide
		setSuggestionsVisible( true );

		// Set up auto-hide sequence
		setNamedTimeout(
			'hide-suggestions',
			() => {
				setSuggestionsVisible( false );

				// Wait for exit animation before clearing suggestions
				setNamedTimeout(
					'clear-suggestions',
					() => {
						clearSuggestions?.();
					},
					SUGGESTIONS_EXIT_ANIMATION_DURATION
				);
			},
			SUGGESTIONS_AUTO_HIDE_DELAY
		);
	}, [
		value,
		suggestions,
		clearAllTimeouts,
		setNamedTimeout,
		clearSuggestions,
	] );

	return (
		<>
			<ChatInput
				value={ value }
				onChange={ onChange }
				onSubmit={ onSubmit }
				onKeyDown={ onKeyDown }
				textareaRef={ textareaRef }
				placeholder={ placeholder }
				isProcessing={ isProcessing }
				onBlur={ onBlur }
				onExpand={ onExpand }
				showExpandButton={ showExpandButton }
				focusOnMount={ focusOnMount }
				customActions={ customActions }
				actionOrder={ actionOrder }
				onStop={ onStop }
			/>
			{ ! value && (
				<Suggestions
					suggestions={ suggestions }
					onSubmit={ handleSuggestionSubmit }
					layout="vertical"
					visible={ suggestionsVisible }
				/>
			) }
		</>
	);
}
