import Search from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import './style.scss';

const SearchBox = ( { isMobile, doSearch, searchTerm, searchBoxRef } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const recordSearchEvent = ( eventName ) =>
		dispatch( recordGoogleEvent( 'PluginsBrowser', eventName ) );

	return (
		<div className="search-box-header__searchbox" ref={ searchBoxRef }>
			<Search
				pinned={ isMobile }
				fitsContainer={ isMobile }
				onSearch={ doSearch }
				defaultValue={ searchTerm }
				placeholder={ translate( 'Try searching "ecommerce"' ) }
				delaySearch={ true }
				recordEvent={ recordSearchEvent }
			/>
		</div>
	);
};

const PopularSearches = ( props ) => {
	const { searchTerms, doSearch, searchedTerm, searchBoxRef } = props;
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
		<div className="search-box-header__recommended-searches" ref={ searchBoxRef }>
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
	const { doSearch, searchTerm, title, searchTerms, isSticky, searchBoxRef } = props;

	// since the search input is an uncontrolled component we need to tap in into the component api and trigger an update
	const updateSearchBox = ( keyword ) => {
		searchBoxRef.current.setKeyword( keyword );
	};

	return (
		<div className={ isSticky ? 'search-box-header' : 'search-box-header fixed-top' }>
			<div className="search-box-header__header">{ title }</div>
			<div className="search-box-header__search">
				<SearchBox doSearch={ doSearch } searchTerm={ searchTerm } />
			</div>
			<PopularSearches
				doSearch={ updateSearchBox }
				searchedTerm={ searchTerm }
				searchTerms={ searchTerms }
				searchBoxRef={ searchBoxRef }
			/>
		</div>
	);
};

export default SearchBoxHeader;
