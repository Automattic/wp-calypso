import page from '@automattic/calypso-router';
import Search, { ImperativeHandle } from '@automattic/search';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { FC, useCallback, MutableRefObject, useRef, RefObject, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ScrollableHorizontalNavigation from 'calypso/components/scrollable-horizontal-navigation';
import { setQueryArgs } from 'calypso/lib/query-args';
import scrollTo from 'calypso/lib/scroll-to';
import withDimensions from 'calypso/lib/with-dimensions';
import {
	ALLOWED_CATEGORIES,
	useCategories,
} from 'calypso/my-sites/plugins/categories/use-categories';
import { useGetCategoryUrl } from 'calypso/my-sites/plugins/categories/use-get-category-url';
import { useTermsSuggestions } from 'calypso/my-sites/plugins/search-box-header/useTermsSuggestions';
import { useLocalizedPlugins } from 'calypso/my-sites/plugins/utils';
import { recordTracksEvent, recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

const SearchBox: FC< {
	categoriesRef: RefObject< HTMLDivElement >;
	isMobile: boolean;
	isSearching: boolean;
	searchBoxRef: MutableRefObject< ImperativeHandle >;
	searchTerm: string;
	searchTerms: string[];
} > = ( { categoriesRef, isMobile, isSearching, searchBoxRef, searchTerm, searchTerms } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const { localizePath } = useLocalizedPlugins();

	const searchTermSuggestion = useTermsSuggestions( searchTerms ) || 'ecommerce';

	const pageToSearch = useCallback(
		( search: string ) => {
			page.show( localizePath( `/plugins/${ selectedSite?.slug || '' }` ) ); // Ensures location.href is on the main Plugins page before setQueryArgs uses it to construct the redirect.
			setQueryArgs( '' !== search ? { s: search } : {} );

			if ( search ) {
				searchBoxRef.current.blur();

				categoriesRef.current &&
					scrollTo( {
						x: 0,
						y:
							categoriesRef.current.getBoundingClientRect().y - // Get to the top of categories
							categoriesRef.current.getBoundingClientRect().height, // But don't show the categories
						duration: 300,
					} );
			}
		},
		[ searchBoxRef, categoriesRef, selectedSite, localizePath ]
	);

	const recordSearchEvent = ( eventName: string ) =>
		dispatch( recordGoogleEvent( 'PluginsBrowser', eventName ) );

	return (
		<Search
			className="search-categories__searchbox"
			ref={ searchBoxRef }
			pinned={ isMobile }
			fitsContainer={ isMobile }
			onSearch={ pageToSearch }
			defaultValue={ searchTerm }
			searchMode="on-enter"
			placeholder={ translate( 'Try searching "%(searchTermSuggestion)s"', {
				args: { searchTermSuggestion },
				textOnly: true,
			} ) }
			delaySearch={ false }
			recordEvent={ recordSearchEvent }
			searching={ isSearching }
			submitOnOpenIconClick
			openIconSide="right"
			displayOpenAndCloseIcons
		/>
	);
};

const SearchCategories: FC< {
	category: string;
	isSearching: boolean;
	isSticky: boolean;
	searchRef: MutableRefObject< ImperativeHandle >;
	searchTerm: string;
	searchTerms: string[];
	stickySearchBoxRef: RefObject< HTMLDivElement >;
	width: number;
} > = ( {
	category,
	isSearching,
	isSticky,
	searchRef,
	searchTerm,
	searchTerms,
	stickySearchBoxRef,
	width,
} ) => {
	const dispatch = useDispatch();
	const getCategoryUrl = useGetCategoryUrl();
	const categoriesRef = useRef< HTMLDivElement >( null );
	// We hide these special categories from the category selector
	const displayCategories = ALLOWED_CATEGORIES.filter(
		( v ) => [ 'paid', 'popular', 'featured' ].indexOf( v ) < 0
	);
	const categories = Object.values( useCategories( displayCategories ) );
	// console.debug( 'category', category );
	// console.debug( 'categories', categories );
	// Update the search box with the value from the url everytime it changes
	// This allows the component to be refilled with a keyword
	// when navigating back to a page via breadcrumb,
	// and get empty when the user accesses a non-search page
	useEffect( () => {
		searchRef?.current?.setKeyword( searchTerm ?? '' );
	}, [ searchRef, searchTerm ] );

	return (
		<>
			<div className={ clsx( 'search-categories', { 'fixed-top': isSticky } ) }>
				<SearchBox
					isMobile={ false }
					isSearching={ isSearching }
					searchBoxRef={ searchRef }
					searchTerm={ searchTerm }
					categoriesRef={ categoriesRef }
					searchTerms={ searchTerms }
				/>

				<ScrollableHorizontalNavigation
					className="search-categories__categories"
					onTabClick={ ( tabSlug ) => {
						dispatch(
							recordTracksEvent( 'calypso_plugins_category_select', {
								tag: tabSlug,
							} )
						);
						page.replace( getCategoryUrl( tabSlug ) );
					} }
					selectedTab={ category ?? categories[ 0 ].slug }
					tabs={ categories }
					width={ width }
				/>
			</div>
			<div className="search-categories__sticky-ref" ref={ stickySearchBoxRef } />
		</>
	);
};

export default withDimensions( SearchCategories );
