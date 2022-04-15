import { Suggestions } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { FC, ChangeEvent, useCallback, useMemo, useRef, useState } from 'react';
import FormTextInput from 'calypso/components/forms/form-text-input';
import Spinner from 'calypso/components/spinner';
import type { Vertical } from './types';
import './style.scss';

interface Props {
	placeholder?: string;
	searchTerm: string;
	suggestions: Vertical[];
	isDisableInput?: boolean | undefined;
	isLoading?: boolean | undefined;
	onInputChange?: ( value: string ) => void;
	onSelect?: ( vertical: Vertical ) => void;
}

const SelectVerticalSuggestionSearch: FC< Props > = ( {
	placeholder,
	searchTerm,
	suggestions,
	isDisableInput,
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
		if ( suggestions.length > 0 ) {
			setIsShowSuggestions( true );
		}

		setIsFocused( true );
	}, [ suggestions, setIsFocused, setIsShowSuggestions ] );

	const handleTextInputChange = useCallback(
		( event: ChangeEvent< HTMLInputElement > ) => {
			setIsShowSuggestions( event.target.value.trim().length > 0 );
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
			{ isLoading && isShowSuggestions && <Spinner /> }
			<FormTextInput
				value={ searchTerm }
				placeholder={ placeholder }
				disabled={ isDisableInput }
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
