import { Gridicon, Suggestions, Spinner } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { FC, useMemo, useRef, useState, useEffect } from 'react';
import FormTextInput from 'calypso/components/forms/form-text-input';
import type { Vertical } from './types';
import './style.scss';

interface Props {
	placeholder?: string;
	searchTerm: string;
	suggestions: Vertical[];
	isLoading?: boolean | undefined;
	isShowSkipOption?: boolean | undefined;
	isDisableInput?: boolean | undefined;
	onInputChange?: ( value: string ) => void;
	onSelect?: ( vertical: Vertical ) => void;
}

const SelectVerticalSuggestionSearch: FC< Props > = ( {
	placeholder,
	searchTerm,
	suggestions,
	isLoading,
	isShowSkipOption,
	isDisableInput,
	onInputChange,
	onSelect,
} ) => {
	const [ isShowSuggestions, setIsShowSuggestions ] = useState( false );
	const [ isFocused, setIsFocused ] = useState( false );
	const inputRef = useRef( null );
	const wrapperRef = useRef< HTMLDivElement >( null );
	const suggestionsRef = useRef< Suggestions >( null );
	const toggleIconRef = useRef( null );
	const translate = useTranslate();
	const isMobile = useViewportMatch( 'small', '<' );

	const showSuggestions = () => {
		setIsShowSuggestions( true );
	};

	const hideSuggestions = () => {
		setIsShowSuggestions( false );
	};

	const handleTextInputBlur = ( event: React.FocusEvent ) => {
		// Hide the suggestion dropdown unless the focus is moved to the toggle icon.
		if ( event && event.relatedTarget?.contains( toggleIconRef.current ) ) {
			return;
		}

		hideSuggestions();
		setIsFocused( false );
	};

	const handleTextInputFocus = () => {
		showSuggestions();
		setIsFocused( true );
	};

	const handleTextInputChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		// Reset the vertical selection if input field is empty.
		// This is so users don't need to explicitly select "Something else" to clear previous selection.
		if ( event.target.value.trim().length === 0 ) {
			onSelect?.( { value: '', label: '' } );
		}

		showSuggestions();
		onInputChange?.( event.target.value );
	};

	const handleToggleSuggestionsBlur = ( event: React.FocusEvent ) => {
		// Hide the suggestion dropdown unless the focus is moved to the input field.
		if ( event && event.relatedTarget?.contains( inputRef.current ) ) {
			return;
		}

		hideSuggestions();
		setIsFocused( false );
	};

	const handleToggleSuggestionsClick = () => {
		if ( isDisableInput ) {
			return;
		}

		if ( isShowSuggestions ) {
			hideSuggestions();
		} else {
			showSuggestions();
		}
	};

	const handleToggleSuggestionsKeyDown = ( event: React.KeyboardEvent< HTMLButtonElement > ) => {
		if ( event.key === 'Escape' || event.key === 'Tab' ) {
			hideSuggestions();
		}
	};

	const handleTextInputKeyDown = ( event: KeyboardEvent ) => {
		if ( event.key === 'Enter' && isShowSuggestions ) {
			event.preventDefault();
		}

		if ( event.key === 'Escape' ) {
			hideSuggestions();
		}

		if ( suggestionsRef.current ) {
			suggestionsRef.current.handleKeyEvent( event );
		}
	};

	const handleSuggestionsSelect = ( { label, value }: { label: string; value?: string } ) => {
		hideSuggestions();
		onSelect?.( { label, value } as Vertical );
	};

	const getSuggestions = useMemo( () => {
		if ( isLoading || ! isShowSuggestions ) {
			return [];
		}

		if ( ! isShowSkipOption ) {
			return suggestions || [];
		}

		return suggestions.concat( [
			{
				value: '',
				label: String( translate( 'Something else' ) ),
				category: 0 < suggestions.length ? '—' : '',
			},
		] );
	}, [ translate, suggestions, isLoading, isShowSuggestions, isShowSkipOption ] );

	useEffect( () => {
		if ( ! ( window.visualViewport && isMobile ) ) {
			return;
		}

		const handleResize = () => {
			if ( ! wrapperRef.current ) {
				return;
			}

			wrapperRef.current.style.setProperty(
				'--select-vertical-search-dropdown-height',
				`${ window.visualViewport.height * 0.4 }px`
			);
		};

		handleResize();

		window.visualViewport.addEventListener( 'resize', handleResize );

		return () => {
			window.visualViewport.removeEventListener( 'resize', handleResize );
		};
	}, [ wrapperRef, isMobile ] );

	return (
		<div
			className={ classnames( 'select-vertical__suggestion-search', {
				'is-focused': isFocused,
				'is-show-suggestions': isShowSuggestions && ! isLoading,
			} ) }
			ref={ wrapperRef }
			aria-expanded={ isShowSuggestions }
		>
			<div className="select-vertical__suggestion-input">
				{ isLoading && isShowSuggestions && <Spinner /> }
				<FormTextInput
					inputRef={ inputRef }
					value={ searchTerm }
					placeholder={ placeholder }
					disabled={ isDisableInput }
					onBlur={ handleTextInputBlur }
					onFocus={ handleTextInputFocus }
					onChange={ handleTextInputChange }
					onKeyDown={ handleTextInputKeyDown }
					autoComplete="off"
				/>
				<Button
					ref={ toggleIconRef }
					onFocus={ () => setIsFocused( true ) }
					onBlur={ handleToggleSuggestionsBlur }
					onClick={ handleToggleSuggestionsClick }
					onKeyDown={ handleToggleSuggestionsKeyDown }
				>
					<Gridicon size={ 18 } icon="chevron-down" />
				</Button>
			</div>
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
