import { Suggestions } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { FC, ChangeEvent, useCallback, useMemo, useRef, useState } from 'react';
import FormTextInput from 'calypso/components/forms/form-text-input';
import type { Vertical } from './types';
import './style.scss';

interface Props {
	placeholder?: string;
	searchTerm: string;
	suggestions: Vertical[];
	isLoading?: boolean | undefined;
	onInputChange?: ( value: string ) => void;
	onSelect?: ( vertical: Vertical ) => void;
}

const SelectVerticalSuggestionSearch: FC< Props > = ( {
	placeholder,
	searchTerm,
	suggestions,
	isLoading,
	onInputChange,
	onSelect,
} ) => {
	const [ isShowSuggestions, setIsShowSuggestions ] = useState( false );
	const [ isFocused, setIsFocused ] = useState( false );
	const suggestionsRef = useRef( null );
	const translate = useTranslate();

	const handleTextInputBlur = useCallback( () => {
		setIsFocused( false );
		setIsShowSuggestions( false );
	}, [ setIsShowSuggestions, setIsFocused ] );

	const handleTextInputFocus = useCallback( () => {
		if ( 0 < suggestions.length ) {
			setIsShowSuggestions( true );
		}

		setIsFocused( true );
	}, [ suggestions, setIsFocused, setIsShowSuggestions ] );

	const handleTextInputChange = useCallback(
		( event: ChangeEvent< HTMLInputElement > ) => {
			setIsShowSuggestions( 0 < event.target.value.trim().length );
			onInputChange?.( event.target.value );
		},
		[ setIsShowSuggestions, onInputChange ]
	);

	const handleTextInputKeyDown = useCallback(
		( event: KeyboardEvent ) => {
			if ( event.key === 'Enter' && isShowSuggestions ) {
				event.preventDefault();
			}

			if ( event.key === 'Escape' ) {
				setIsShowSuggestions( false );
			}

			if ( suggestionsRef.current ) {
				( suggestionsRef.current as Suggestions ).handleKeyEvent( event );
			}
		},
		[ setIsShowSuggestions, isShowSuggestions, suggestionsRef ]
	);

	const handleSuggestionsSelect = useCallback(
		( { label, value }: { label: string; value?: string } ) => {
			setIsShowSuggestions( false );
			onInputChange?.( label );
			onSelect?.( { label, value } as Vertical );
		},
		[ setIsShowSuggestions, onInputChange ]
	);

	const getSuggestions = useMemo( () => {
		if ( isLoading || ! isShowSuggestions ) {
			return [];
		}

		return suggestions.concat( [
			{
				value: '',
				label: String( translate( 'Something else' ) ),
				category: 0 < suggestions.length ? '—' : '',
			},
		] );
	}, [ translate, suggestions, isLoading, isShowSuggestions ] );

	return (
		<div
			className={ classnames( 'select-vertical__suggestion-search', {
				'is-focused': isFocused,
				'is-show-suggestions': isShowSuggestions,
			} ) }
		>
			<FormTextInput
				value={ searchTerm }
				placeholder={ placeholder }
				onBlur={ handleTextInputBlur }
				onFocus={ handleTextInputFocus }
				onChange={ handleTextInputChange }
				onKeyDown={ handleTextInputKeyDown }
				autoComplete="off"
			/>
			<Suggestions
				className="select-vertical__suggestion-search-dropdown"
				ref={ suggestionsRef }
				title=""
				query={ searchTerm }
				suggestions={ getSuggestions }
				suggest={ handleSuggestionsSelect }
			/>
		</div>
	);
};

export default SelectVerticalSuggestionSearch;
