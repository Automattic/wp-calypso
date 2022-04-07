import Search from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import './style.scss';

const SearchBox = ( { isMobile, doSearch, searchTerm, searchBoxRef } ) => {
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
				defaultValue={ searchTerm }
				searchMode="on-enter"
				placeholder={ translate( 'Try searching "ecommerce"' ) }
				delaySearch={ false }
				recordEvent={ recordSearchEvent }
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
				{ searchTerms.map( ( searchTerm, n ) =>
					searchTerm === searchedTerm ? (
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
					)
				) }
			</div>
		</div>
	);
};

const SearchBoxHeader = ( props ) => {
	const { doSearch, searchTerm, title, searchTerms, isSticky, popularSearchesRef } = props;
	const searchBoxRef = useRef( null );

	// since the search input is an uncontrolled component we need to tap in into the component api and trigger an update
	const updateSearchBox = ( keyword ) => {
		searchBoxRef.current.setKeyword( keyword );
		doSearch( keyword );
	};

	return (
		<div className={ isSticky ? 'search-box-header fixed-top' : 'search-box-header' }>
			<div className="search-box-header__header">{ title }</div>
			<div className="search-box-header__search">
				<SearchBox doSearch={ doSearch } searchTerm={ searchTerm } searchBoxRef={ searchBoxRef } />
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
