import Search from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import './style.scss';

const SearchBox = ( { isMobile, doSearch, searchTerm, searchBoxRef, isSearching } ) => {
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
				searching={ isSearching }
			/>
		</div>
	);
};

const SearchLink = ( { searchTerm, currentTerm, onSelect } ) => {
	const classes = [ 'search-box-header__recommended-searches-list-item' ];

	if ( searchTerm === currentTerm ) {
		classes.push( 'search-box-header__recommended-searches-list-item-selected' );

		return <span className={ classes.join( ' ' ) }>{ searchTerm }</span>;
	}

	return (
		<a
			href={ `/plugins?s=${ searchTerm }` }
			className={ classes.join( ' ' ) }
			onClick={ onSelect }
			onKeyPress={ onSelect }
		>
			{ searchTerm }
		</a>
	);
};

const PopularSearches = ( props ) => {
	const { searchTerms, doSearch, searchedTerm, popularSearchesRef } = props;
	const dispatch = useDispatch();
	const translate = useTranslate();
	const clickHandler = ( searchTerm ) => ( event ) => {
		event.preventDefault();

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
					<SearchLink
						key={ 'search-box-item' + n }
						onSelect={ clickHandler( searchTerm ) }
						searchTerm={ searchTerm }
						currentTerm={ searchedTerm }
					/>
				) ) }
			</div>
		</div>
	);
};

const SearchBoxHeader = ( props ) => {
	const {
		doSearch,
		searchTerm,
		title,
		searchTerms,
		isSticky,
		popularSearchesRef,
		isSearching,
		searchRef,
	} = props;

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
