import { Gridicon } from '@automattic/components';
import { __experimentalUseFocusOutside as useFocusOutside } from '@wordpress/compose';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import Search, { SEARCH_MODE_ON_ENTER } from 'calypso/components/search';
import './style.scss';
interface SearchThemesProps {
	query: string;
	onSearch: ( query: string ) => void;
	recordTracksEvent: ( eventName: string, eventProperties?: object ) => void;
}
const SearchThemes: React.FC< SearchThemesProps > = ( { query, onSearch, recordTracksEvent } ) => {
	const wrapperRef = useRef< HTMLDivElement | null >( null );
	const searchRef = useRef< Search | null >( null );
	const translate = useTranslate();
	const [ searchInput, setSearchInput ] = useState( query );
	const [ isApplySearch, setIsApplySearch ] = useState( false );
	const focusOnInput = () => {
		searchRef.current?.focus();
	};
	const clearSearch = () => {
		setSearchInput( '' );
		focusOnInput();
	};
	const closeSearch = () => {
		searchRef.current?.blur();
	};
	const onKeyDown = ( event: React.KeyboardEvent< HTMLInputElement > ) => {
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
				className={ clsx( 'search-themes-card' ) }
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
					onSearchClose={ closeSearch }
					onSearchChange={ ( inputValue: string ) => {
						setSearchInput( inputValue );
						setIsApplySearch( false );
					} }
				>
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
