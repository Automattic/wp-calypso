import Search from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { Fragment, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setQueryArgs } from 'calypso/lib/query-args';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import './style.scss';

const SearchBox = ( { isMobile, searchTerm, doSearch, searchBoxRef, isSearching } ) => {
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
				onSearch={ doSearch }
				onSearchClose={ () => setQueryArgs( {} ) }
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
	const { searchTerms, doSearch, searchedTerm, popularSearchesRef } = props;
	const dispatch = useDispatch();
	const translate = useTranslate();

	const onClick = ( searchTerm ) => {
		dispatch(
			recordTracksEvent( 'calypso_plugins_popular_searches_click', {
				search_term: searchTerm,
			} )
		);

		doSearch( searchTerm );
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

	const doSearch = useCallback( ( receivedSearch ) => {
		setQueryArgs( '' !== receivedSearch ? { s: receivedSearch } : {} );
	}, [] );

	// since the search input is an uncontrolled component we need to tap in into the component api and trigger an update
	const updateSearchBox = ( keyword ) => {
		searchRef.current.setKeyword( keyword );
		doSearch( keyword );
	};

	return (
		<div className={ isSticky ? 'search-box-header fixed-top' : 'search-box-header' }>
			<div className="search-box-header__header">{ title }</div>
			<div className="search-box-header__search">
				<SearchBox
					doSearch={ doSearch }
					searchTerm={ searchTerm }
					searchBoxRef={ searchRef }
					isSearching={ isSearching }
				/>
			</div>
			<PopularSearches
				doSearch={ updateSearchBox }
				searchedTerm={ searchTerm }
				searchTerms={ searchTerms }
				popularSearchesRef={ popularSearchesRef }
			/>
		</div>
	);
};

export default SearchBoxHeader;
