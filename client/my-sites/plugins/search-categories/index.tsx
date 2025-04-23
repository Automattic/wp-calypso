import page from '@automattic/calypso-router';
import Search, { ImperativeHandle } from '@automattic/search';
import { isDesktop } from '@automattic/viewport';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { FC, useCallback, MutableRefObject, useRef, RefObject, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ScrollableHorizontalNavigation from 'calypso/components/scrollable-horizontal-navigation';
import { setQueryArgs } from 'calypso/lib/query-args';
import scrollTo from 'calypso/lib/scroll-to';
import Categories from 'calypso/my-sites/plugins/categories';
import {
	ALLOWED_CATEGORIES,
	useCategories,
} from 'calypso/my-sites/plugins/categories/use-categories';
import { useGetCategoryUrl } from 'calypso/my-sites/plugins/categories/use-get-category-url';
import { useLocalizedPlugins } from 'calypso/my-sites/plugins/utils';
import { recordTracksEvent, recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { useTermsSuggestions } from '../use-terms-suggestions';

import './style.scss';

const SearchBox: FC< {
	categoriesRef: RefObject< HTMLDivElement >;
	isSearching: boolean;
	searchBoxRef: MutableRefObject< ImperativeHandle >;
	searchTerm: string;
	searchTerms: string[];
} > = ( { categoriesRef, isSearching, searchBoxRef, searchTerm, searchTerms } ) => {
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
			className={ clsx( 'search-categories__searchbox', {
				'search-categories__searchbox--mobile': ! isDesktop(),
			} ) }
			ref={ searchBoxRef }
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
} > = ( { category, isSearching, isSticky, searchRef, searchTerm, searchTerms } ) => {
	const dispatch = useDispatch();
	const getCategoryUrl = useGetCategoryUrl();
	const categoriesRef = useRef< HTMLDivElement >( null );

	// We hide these special categories from the category selector
	const displayCategories = ALLOWED_CATEGORIES.filter(
		( v ) => [ 'paid', 'popular', 'featured' ].indexOf( v ) < 0
	);
	const categories = Object.values( useCategories( displayCategories ) ).filter(
		( item ) => ! item.showOnlyActive || item.slug === category
	);

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
					isSearching={ isSearching }
					searchBoxRef={ searchRef }
					searchTerm={ searchTerm }
					categoriesRef={ categoriesRef }
					searchTerms={ searchTerms }
				/>

				{ isDesktop() ? (
					<>
						<div className="search-categories__vertical-separator" />

						<ScrollableHorizontalNavigation
							className="search-categories__categories"
							onTabClick={ ( tabSlug ) => {
								dispatch(
									recordTracksEvent( 'calypso_plugins_category_select', {
										tag: tabSlug,
									} )
								);

								page( getCategoryUrl( tabSlug ) );
							} }
							selectedTab={ category ?? categories[ 0 ].slug }
							tabs={ categories }
							titleField="menu"
						/>
					</>
				) : (
					<div ref={ categoriesRef }>
						<Categories selected={ category } noSelection={ searchTerm ? true : false } />
					</div>
				) }
			</div>
			{ isSticky && <div className="search-categories__sticky-placeholder" /> }
		</>
	);
};

export default SearchCategories;
