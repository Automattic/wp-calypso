import Search from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setQueryArgs } from 'calypso/lib/query-args';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
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

const SearchBoxHeader = ( props ) => {
	const {
		searchTerm,
		title,
		isSticky,
		stickySearchBoxRef,
		isSearching,
		searchRef,
		renderTitleInH1,
	} = props;

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
			{ renderTitleInH1 && <h1 className="search-box-header__header">{ title }</h1> }
			{ ! renderTitleInH1 && <div className="search-box-header__header">{ title }</div> }
			<div className="search-box-header__search">
				<SearchBox
					searchTerm={ searchTerm }
					searchBoxRef={ searchRef }
					isSearching={ isSearching }
				/>
			</div>
			<div className="search-box-header__sticky-ref" ref={ stickySearchBoxRef }></div>
		</div>
	);
};

export default SearchBoxHeader;
