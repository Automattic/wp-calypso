import page from '@automattic/calypso-router';
import { ImperativeHandle } from '@automattic/search';
import { isDesktop } from '@automattic/viewport';
import { SearchControl } from '@wordpress/components';
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
	searchBoxRef: MutableRefObject< ImperativeHandle >;
	searchTerm: string;
	searchTerms: string[];
} > = ( { categoriesRef, searchBoxRef, searchTerm, searchTerms } ) => {
	// Create a ref for the SearchControl input
	const inputRef = useRef< HTMLInputElement >( null );
	const dispatch = useDispatch();
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const { localizePath } = useLocalizedPlugins();

	const searchTermSuggestion = useTermsSuggestions( searchTerms ) || 'ecommerce';

	// Update search in URL and handle side effects
	const updateSearch = useCallback(
		( search: string ) => {
			// Update URL query params
			page.show( localizePath( `/plugins/${ selectedSite?.slug || '' }` ) );
			setQueryArgs( search ? { s: search } : {} );

			// Handle side effects when search is not empty
			if ( search ) {
				searchBoxRef.current?.blur();
				categoriesRef.current &&
					scrollTo( {
						x: 0,
						y:
							categoriesRef.current.getBoundingClientRect().y - // Get to the top of categories
							categoriesRef.current.getBoundingClientRect().height, // But don't show the categories
						duration: 300,
					} );
			}

			// Track search event
			dispatch(
				recordGoogleEvent( 'PluginsBrowser', search ? 'SearchInitiated' : 'SearchCleared' )
			);
		},
		[ searchBoxRef, categoriesRef, selectedSite, localizePath, dispatch ]
	);

	// Sync the imperative handle with the SearchControl input
	useEffect( () => {
		if ( inputRef.current ) {
			searchBoxRef.current = {
				blur: () => inputRef.current?.blur(),
				focus: () => inputRef.current?.focus(),
				clear: () => {
					// Clear the search by updating the URL
					updateSearch( '' );
				},
				setKeyword: ( value: string ) => {
					// Update search with the new value
					updateSearch( value );
				},
			};
		}
	}, [ searchBoxRef, inputRef, updateSearch ] );

	// Handle controlled input changes
	const onChange = useCallback(
		( newValue: string ) => {
			// Only update URL on clear
			if ( newValue === '' ) {
				updateSearch( '' );
			}
		},
		[ updateSearch ]
	);

	// Handle Enter key press
	const onKeyDown = useCallback(
		( event: React.KeyboardEvent< HTMLInputElement > ) => {
			if ( event.key === 'Enter' && event.target ) {
				event.preventDefault();
				const value = ( event.target as HTMLInputElement ).value;
				updateSearch( value );
			}
		},
		[ updateSearch ]
	);

	return (
		<SearchControl
			__nextHasNoMarginBottom
			ref={ inputRef }
			className={ clsx( {
				'components-search-control--mobile': ! isDesktop(),
			} ) }
			value={ searchTerm }
			placeholder={ translate( 'Try searching "%(searchTermSuggestion)s"', {
				args: { searchTermSuggestion },
				textOnly: true,
			} ) }
			onChange={ onChange }
			onKeyDown={ onKeyDown }
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
} > = ( { category, isSticky, searchRef, searchTerm, searchTerms } ) => {
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

	return (
		<>
			<div className={ clsx( 'search-categories', { 'fixed-top': isSticky } ) }>
				<SearchBox
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
