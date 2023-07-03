import Search from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setQueryArgs } from 'calypso/lib/query-args';
import scrollTo from 'calypso/lib/scroll-to';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { resetBreadcrumbs } from 'calypso/state/breadcrumb/actions';
import { useTermsSuggestions } from './useTermsSuggestions';
import './style.scss';

const SearchBox = ( {
	isMobile,
	searchTerm,
	searchBoxRef,
	categoriesRef,
	isSearching,
	searchTerms,
} ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const searchTermSuggestion = useTermsSuggestions( searchTerms ) || 'ecommerce';

	const pageToSearch = useCallback(
		( s ) => {
			const isCategoryPage = window.location.href.includes( '/plugins/browse/' );
			if ( isCategoryPage ) {
				dispatch( resetBreadcrumbs() );
			}

			page.show( '/plugins' ); // Ensures location.href is on the main Plugins page before setQueryArgs uses it to construct the redirect.
			setQueryArgs( '' !== s ? { s } : {} );
			searchBoxRef.current.blur();
			scrollTo( {
				x: 0,
				y:
					categoriesRef.current?.getBoundingClientRect().y - // Get to the top of categories
					categoriesRef.current?.getBoundingClientRect().height, // But don't show the categories
				duration: 300,
			} );
		},
		[ searchBoxRef, categoriesRef, dispatch ]
	);

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
				placeholder={ translate( 'Try searching "%(searchTermSuggestion)s"', {
					args: { searchTermSuggestion },
				} ) }
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
		subtitle,
		isSticky,
		stickySearchBoxRef,
		isSearching,
		searchRef,
		categoriesRef,
		renderTitleInH1,
		searchTerms,
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

	const classNames = [ 'search-box-header' ];

	if ( isSticky ) {
		classNames.push( 'fixed-top' );
	}

	return (
		<div className={ classNames.join( ' ' ) }>
			{ renderTitleInH1 && <h1 className="search-box-header__header">{ title }</h1> }
			{ ! renderTitleInH1 && <div className="search-box-header__header">{ title }</div> }
			{ subtitle && <p className="search-box-header__subtitle">{ subtitle }</p> }
			<div className="search-box-header__search">
				<SearchBox
					searchTerm={ searchTerm }
					searchBoxRef={ searchRef }
					isSearching={ isSearching }
					categoriesRef={ categoriesRef }
					searchTerms={ searchTerms }
				/>
			</div>
			<div className="search-box-header__sticky-ref" ref={ stickySearchBoxRef }></div>
		</div>
	);
};

export default SearchBoxHeader;
