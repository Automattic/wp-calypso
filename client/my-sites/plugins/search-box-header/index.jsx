import page from '@automattic/calypso-router';
import Search from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setQueryArgs } from 'calypso/lib/query-args';
import scrollTo from 'calypso/lib/scroll-to';
import { useLocalizedPlugins } from 'calypso/my-sites/plugins/utils';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { useTermsSuggestions } from '../use-terms-suggestions';
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
	const selectedSite = useSelector( getSelectedSite );
	const { localizePath } = useLocalizedPlugins();

	const searchTermSuggestion = useTermsSuggestions( searchTerms ) || 'ecommerce';

	const pageToSearch = useCallback(
		( search ) => {
			page.show( localizePath( `/plugins/${ selectedSite?.slug || '' }` ) ); // Ensures location.href is on the main Plugins page before setQueryArgs uses it to construct the redirect.
			setQueryArgs( '' !== search ? { s: search } : {} );

			if ( search ) {
				searchBoxRef.current.blur();
				scrollTo( {
					x: 0,
					y:
						categoriesRef.current?.getBoundingClientRect().y - // Get to the top of categories
						categoriesRef.current?.getBoundingClientRect().height, // But don't show the categories
					duration: 300,
				} );
			}
		},
		[ searchBoxRef, categoriesRef, selectedSite, localizePath ]
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
				submitOnOpenIconClick
				openIconSide="right"
				displayOpenAndCloseIcons
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

	// Update the search box with the value from the url everytime it changes
	// This allows the component to be refilled with a keyword
	// when navigating back to a page via breadcrumb,
	// and get empty when the user accesses a non-search page
	useEffect( () => {
		searchRef?.current?.setKeyword( searchTerm ?? '' );
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
