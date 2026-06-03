import React, { useCallback, useEffect, useState } from 'react';
import type { Suggestion } from '../../types';
import { type ActionButton, ChatInput } from '../chat/ChatInput';
import { Suggestions } from '../chat/Suggestions';
import { useMultiTimeout } from '../../hooks/useMultiTimeout';

// Constants for better maintainability
const SUGGESTIONS_AUTO_HIDE_DELAY = 4000; // 4 seconds

interface CompactViewProps {
	value: string;
	onChange: ( value: string ) => void;
	onSubmit: () => void;
	onKeyDown: ( e: React.KeyboardEvent< HTMLTextAreaElement > ) => void;
	textareaRef: React.RefObject< HTMLTextAreaElement >;
	placeholder?: string | string[];
	isProcessing: boolean;
	onBlur?: () => void;
	onFocus?: () => void;
	onExpand?: () => void;
	showExpandButton?: boolean;
	focusOnMount?: boolean;
	customActions?: ActionButton[];
	actionOrder?: 'before-submit' | 'after-submit';
	onStop?: () => void;
	suggestions?: Suggestion[];
	clearSuggestions?: () => void;
	handleSuggestionSubmit?: (
		selectedSuggestion: Suggestion,
		availableSuggestions: Suggestion[]
	) => void;
	expandOnClick?: boolean;
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
	onFocus,
	onExpand,
	showExpandButton = true,
	focusOnMount = false,
	customActions,
	actionOrder,
	onStop,
	suggestions,
	clearSuggestions,
	handleSuggestionSubmit,
	expandOnClick = false,
}: CompactViewProps ) {
	const [ suggestionsVisible, setSuggestionsVisible ] = useState( false );
	const [ dropdownOpen, setDropdownOpen ] = useState( false );

	// Use our custom timeout hook for proper cleanup
	const { setNamedTimeout, clearAllTimeouts } = useMultiTimeout();

	const scheduleSuggestionsHide = useCallback( () => {
		setNamedTimeout(
			'hide-suggestions',
			() => {
				setSuggestionsVisible( false );
			},
			SUGGESTIONS_AUTO_HIDE_DELAY
		);
	}, [ setNamedTimeout ] );

	const hideSuggestionsAfterTimeout = useCallback( () => {
		if ( ! dropdownOpen ) {
			scheduleSuggestionsHide();
		}
	}, [ dropdownOpen, scheduleSuggestionsHide ] );

	const showSuggestions = useCallback( () => {
		clearAllTimeouts();
		setSuggestionsVisible( true );
	}, [ clearAllTimeouts ] );

	const handleDropdownOpenChange = useCallback(
		( nextOpen: boolean ) => {
			setDropdownOpen( nextOpen );
			if ( nextOpen ) {
				showSuggestions();
			} else {
				scheduleSuggestionsHide();
			}
		},
		[ scheduleSuggestionsHide, showSuggestions ]
	);

	// Handle click event for expandOnClick functionality
	const handleClick = useCallback( () => {
		// Only expand on click if expandOnClick is enabled AND the input is empty
		if ( expandOnClick && onExpand && ! value ) {
			onExpand();
		}
	}, [ expandOnClick, onExpand, value ] );

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

		// Keep suggestions mounted while a dropdown is open, including when the
		// dropdown is portaled outside the suggestions row.
		if ( dropdownOpen ) {
			setSuggestionsVisible( true );
			return;
		}

		// Case 3: Input empty + suggestions available - show with auto-hide
		setSuggestionsVisible( true );

		scheduleSuggestionsHide();
	}, [
		value,
		suggestions,
		dropdownOpen,
		clearAllTimeouts,
		scheduleSuggestionsHide,
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
				onFocus={ onFocus }
				onClick={ handleClick }
				onExpand={ onExpand }
				showExpandButton={ showExpandButton }
				focusOnMount={ focusOnMount }
				customActions={ customActions }
				actionOrder={ actionOrder }
				onStop={ onStop }
				expandOnClick={ expandOnClick }
				onMouseEnter={ showSuggestions }
				onMouseLeave={ () => hideSuggestionsAfterTimeout() }
			/>
			{ ! value && (
				<Suggestions
					suggestions={ suggestions }
					onSubmit={ handleSuggestionSubmit }
					layout="floating"
					visible={ suggestionsVisible }
					onMouseEnter={ showSuggestions }
					onMouseLeave={ () => hideSuggestionsAfterTimeout() }
					onDropdownOpenChange={ handleDropdownOpenChange }
				/>
			) }
		</>
	);
}
