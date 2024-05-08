import { Gridicon } from '@automattic/components';
import { __experimentalUseFocusOutside as useFocusOutside } from '@wordpress/compose';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState, useEffect } from 'react';
import KeyedSuggestions from 'calypso/components/keyed-suggestions';
import Search, { SEARCH_MODE_ON_ENTER } from 'calypso/components/search';
import { useSelector } from 'calypso/state';
import { getThemeFilters } from 'calypso/state/themes/selectors';
import { filterDelistedTaxonomyTermSlugs } from 'calypso/state/themes/utils';
import { allowSomeThemeFilters, computeEditedSearchElement, insertSuggestion } from './utils';
import type { ThemeFilters } from './types';
import './style.scss';
interface SearchThemesProps {
	query: string;
	onSearch: ( query: string ) => void;
	recordTracksEvent: ( eventName: string, eventProperties?: object ) => void;
}
const SearchThemes: React.FC< SearchThemesProps > = ( { query, onSearch, recordTracksEvent } ) => {
	const wrapperRef = useRef< HTMLDivElement | null >( null );
	const searchRef = useRef< Search | null >( null );
	const suggestionsRef = useRef< KeyedSuggestions | null >( null );
	const translate = useTranslate();
	const filters = useSelector( ( state ) =>
		filterDelistedTaxonomyTermSlugs(
			allowSomeThemeFilters( getThemeFilters( state ) as ThemeFilters )
		)
	);
	const [ searchInput, setSearchInput ] = useState( query );
	const [ cursorPosition, setCursorPosition ] = useState( 0 );
	const [ editedSearchElement, setEditedSearchElement ] = useState( '' );
	const [ isApplySearch, setIsApplySearch ] = useState( false );
	const [ isSearchOpen, setIsSearchOpen ] = useState( false );
	// Sync the value of the search input with the subject filter,
	// which is equivalent to adding `subject:<term>` to the search input
	useEffect( () => {
		// Prevent unnecessary render when there is unfinished filter subject:
		if ( ! isSearchOpen ) {
			setSearchInput( query );
		}
	}, [ query ] );
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
	const clearSearch = () => {
		setSearchInput( '' );
		focusOnInput();
	};
	const closeSearch = () => {
		setIsSearchOpen( false );
		searchRef.current?.blur();
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
			updatedInput = insertSuggestion( suggestion, searchInput, cursorPosition );
			// Clean up duplicate criteria
			updatedInput = updatedInput.replace( /(\b(feature|column|subject):.*[^ ]\b)(?=.*\1)/gi, '' );
			// Only allow one `subject:` filter
			updatedInput = updatedInput.replace( /(subject):([\w-]*[\s|$])(?=.*\1)/gi, '' );
			// Strip filters and excess whitespace
			updateInput( updatedInput.replace( /\s+/g, ' ' ).trim() );
			closeSearch();
		}
	};
	const onKeyDown = ( event: React.KeyboardEvent< HTMLInputElement > ) => {
		suggestionsRef.current?.handleKeyEvent( event );
		if ( event.key === 'Enter' ) {
			searchRef.current?.blur();
		}
	};
	const onClearIconClick = () => {
		clearSearch();
		recordTracksEvent( 'search_clear_icon_click' );
	};
	return (
		<div ref={ wrapperRef } { ...useFocusOutside( closeSearch ) }>
			<div
				className={ clsx( 'search-themes-card', {
					'is-suggestions-open': isSearchOpen,
				} ) }
				role="presentation"
				data-tip-target="search-themes-card"
				onClick={ focusOnInput }
			>
				<Search
					initialValue={ searchInput }
					value={ searchInput }
					ref={ searchRef }
					placeholder={ translate( 'Search themes…' ) }
					analyticsGroup="Themes"
					searchMode={ SEARCH_MODE_ON_ENTER }
					applySearch={ isApplySearch }
					hideClose
					onKeyDown={ onKeyDown }
					onSearch={ onSearch }
					onSearchOpen={ () => setIsSearchOpen( true ) }
					onSearchClose={ closeSearch }
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
							recordTracksEvent={ recordTracksEvent }
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
								onClick={ onClearIconClick }
							/>
						</div>
					) }
				</Search>
			</div>
		</div>
	);
};

interface SearchThemesV2Props {
	query: string;
	onSearch: ( query: string ) => void;
}

const SearchThemesV2: React.FC< SearchThemesV2Props > = ( { query, onSearch } ) => {
	const translate = useTranslate();

	return (
		<div className="search-themes-card" role="presentation" data-tip-target="search-themes-card">
			<Search
				initialValue={ query }
				value={ query }
				placeholder={ translate( 'Search themes…' ) }
				analyticsGroup="Themes"
				searchMode={ SEARCH_MODE_ON_ENTER }
				onSearch={ onSearch }
			/>
		</div>
	);
};

export { SearchThemes, SearchThemesV2 };
