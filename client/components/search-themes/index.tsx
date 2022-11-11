import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import KeyedSuggestions from 'calypso/components/keyed-suggestions';
import Search, { SEARCH_MODE_ON_ENTER } from 'calypso/components/search';
import StickyPanel from 'calypso/components/sticky-panel';
import useOutsideClickCallback from 'calypso/lib/use-outside-click-callback';
import { getThemeFilters } from 'calypso/state/themes/selectors';
import { allowSomeThemeFilters, computeEditedSearchElement, insertSuggestion } from './utils';
import type { ThemeFilters } from './types';
import './style.scss';

interface SearchThemesProps {
	query: string;
	onSearch: ( query: string ) => void;
}

const SearchThemes: React.FC< SearchThemesProps > = ( { query, onSearch } ) => {
	const wrapperRef = useRef< HTMLDivElement | null >( null );
	const searchRef = useRef< Search | null >( null );
	const suggestionsRef = useRef< KeyedSuggestions | null >( null );
	const translate = useTranslate();
	const filters = useSelector( ( state ) =>
		allowSomeThemeFilters( getThemeFilters( state ) as ThemeFilters )
	);
	const [ searchInput, setSearchInput ] = useState( query );
	const [ cursorPosition, setCursorPosition ] = useState( 0 );
	const [ editedSearchElement, setEditedSearchElement ] = useState( '' );
	const [ isApplySearch, setIsApplySearch ] = useState( false );
	const [ isSearchOpen, setIsSearchOpen ] = useState( false );

	useOutsideClickCallback( wrapperRef, () => setIsSearchOpen( false ), true );

	const findTextForSuggestions = ( inputValue: string ) => {
		const val = inputValue;
		window.requestAnimationFrame( () => {
			const selectionStart = searchRef.current?.searchInput.selectionStart;
			const [ editedSearchElement, cursorPosition ] = computeEditedSearchElement(
				val,
				selectionStart
			);

			setEditedSearchElement( editedSearchElement );
			setCursorPosition( cursorPosition );
		} );
	};

	const updateInput = ( updatedInput: string ) => {
		setSearchInput( updatedInput );
		setIsApplySearch( true );
		searchRef.current?.clear();
	};

	const focusOnInput = () => {
		searchRef.current?.focus();
	};

	const suggest = ( suggestion: string, isTopLevelTerm: boolean ) => {
		let updatedInput = searchInput;

		if ( isTopLevelTerm ) {
			// Since we are adding an unfinished feature to the search, like "feature:" or "column:",
			// remove other unfinished features from the search. The user doesn't want to have their
			// search bar reading "feature: column:" after clicking feature, then column.
			updatedInput = searchInput.replace( /(feature|column|subject):(\s|$)/i, '' );

			// Add an extra leading space sometimes. If the user has "abcd" in
			// their bar and they click to add "feature:", we want "abcd feature:",
			// not "abcdfeature:".
			if ( updatedInput.length > 0 && updatedInput.slice( -1 ) !== ' ' ) {
				suggestion = ' ' + suggestion;
			}

			updateInput( updatedInput + suggestion );
			focusOnInput();
		} else {
			updateInput( insertSuggestion( suggestion, searchInput, cursorPosition ) );
			setIsSearchOpen( false );
			searchRef.current?.blur();
		}
	};

	const clearSearch = () => {
		setSearchInput( '' );
		focusOnInput();
	};

	const onClickInside = () => {
		focusOnInput();
	};

	const onKeyDown = ( event: React.KeyboardEvent< HTMLInputElement > ) => {
		suggestionsRef.current?.handleKeyEvent( event );
	};

	return (
		<div ref={ wrapperRef }>
			<StickyPanel>
				<div
					className="search-themes-card"
					role="presentation"
					data-tip-target="search-themes-card"
					onClick={ onClickInside }
				>
					<Search
						initialValue={ searchInput }
						value={ searchInput }
						ref={ searchRef }
						placeholder={ translate( 'Search all themes…' ) }
						analyticsGroup="Themes"
						searchMode={ SEARCH_MODE_ON_ENTER }
						applySearch={ isApplySearch }
						hideClose
						onKeyDown={ onKeyDown }
						onSearch={ onSearch }
						onSearchOpen={ () => setIsSearchOpen( true ) }
						onSearchClose={ () => setIsSearchOpen( false ) }
						onSearchChange={ ( inputValue: string ) => {
							findTextForSuggestions( inputValue );
							setSearchInput( inputValue );
							setIsApplySearch( false );
						} }
					>
						{ isSearchOpen && (
							<KeyedSuggestions
								ref={ suggestionsRef }
								input={ editedSearchElement }
								terms={ filters }
								suggest={ suggest }
								exclusions={ [ /twenty.*?two/ ] }
								showAllLabelText={ translate( 'View all' ) }
								showLessLabelText={ translate( 'View less' ) }
								isShowTopLevelTermsOnMount
								isDisableAutoSelectSuggestion
								isDisableTextHighlight
							/>
						) }
						{ searchInput !== '' && (
							<div className="search-themes-card__icon">
								<Gridicon
									icon="cross"
									className="search-themes-card__icon-close"
									tabIndex={ 0 }
									aria-controls="search-component-search-themes"
									aria-label={ translate( 'Clear Search' ) }
									onClick={ clearSearch }
								/>
							</div>
						) }
					</Search>
				</div>
			</StickyPanel>
		</div>
	);
};

export default SearchThemes;
