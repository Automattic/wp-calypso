import Search from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { Fragment, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setQueryArgs } from 'calypso/lib/query-args';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import './style.scss';

function pageToSearch( s ) {
	setQueryArgs( '' !== s ? { s } : {} );
}

const SearchBox = ( { isMobile, searchTerm, searchBoxRef, isSearching } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const recordSearchEvent = ( eventName ) =>
		dispatch( recordGoogleEvent( 'PluginsBrowser', eventName ) );

	return (
		<div className="search-box-header__searchbox">
			<Search
				ref={ searchBoxRef }
				pinned={ isMobile }
				fitsContainer={ isMobile }
				onSearch={ pageToSearch }
				defaultValue={ searchTerm }
				searchMode="on-enter"
				placeholder={ translate( 'Try searching "ecommerce"' ) }
				delaySearch={ false }
				recordEvent={ recordSearchEvent }
				searching={ isSearching }
			/>
		</div>
	);
};

const PopularSearches = ( props ) => {
	const { searchTerms, searchedTerm, searchBoxRef, popularSearchesRef } = props;
	const dispatch = useDispatch();
	const translate = useTranslate();

	const onClick = ( searchTerm ) => {
		dispatch(
			recordTracksEvent( 'calypso_plugins_popular_searches_click', {
				search_term: searchTerm,
			} )
		);

		// When loading a search via click instead of interacting with the search
		// box input directly we need to set the search term separately.
		searchBoxRef?.current?.setKeyword( searchTerm );
		pageToSearch( searchTerm );
	};

	return (
		<div className="search-box-header__recommended-searches" ref={ popularSearchesRef }>
			<div className="search-box-header__recommended-searches-title">
				{ translate( 'Most popular searches' ) }
			</div>

			<div className="search-box-header__recommended-searches-list">
				{ searchTerms.map( ( searchTerm, n ) => (
					<Fragment key={ 'search-box-item' + n }>
						{ searchTerm === searchedTerm ? (
							<span
								className="search-box-header__recommended-searches-list-item search-box-header__recommended-searches-list-item-selected"
								key={ 'recommended-search-item-' + n }
							>
								{ searchTerm }
							</span>
						) : (
							<span
								onClick={ () => onClick( searchTerm ) }
								onKeyPress={ () => onClick( searchTerm ) }
								role="link"
								tabIndex={ 0 }
								className="search-box-header__recommended-searches-list-item"
								key={ 'recommended-search-item-' + n }
							>
								{ searchTerm }
							</span>
						) }
						{ n !== searchTerms.length - 1 && <>,&nbsp;</> }
					</Fragment>
				) ) }
			</div>
		</div>
	);
};

const SearchBoxHeader = ( props ) => {
	const { searchTerm, title, searchTerms, isSticky, popularSearchesRef, isSearching, searchRef } =
		props;

	// Clear the keyword in search box on PluginsBrowser load if required.
	// Required when navigating to a new plugins browser location
	// without using close search ("X") to clear. e.g. When clicking
	// clear in the search results header.
	useEffect( () => {
		if ( ! searchTerm ) {
			searchRef?.current?.setKeyword( '' );
		}
	}, [ searchRef, searchTerm ] );

	return (
		<div className={ isSticky ? 'search-box-header fixed-top' : 'search-box-header' }>
			<div className="search-box-header__header">{ title }</div>
			<div className="search-box-header__search">
				<SearchBox
					searchTerm={ searchTerm }
					searchBoxRef={ searchRef }
					isSearching={ isSearching }
				/>
			</div>
			<PopularSearches
				searchBoxRef={ searchRef }
				searchedTerm={ searchTerm }
				searchTerms={ searchTerms }
				popularSearchesRef={ popularSearchesRef }
			/>
		</div>
	);
};

export default SearchBoxHeader;
