import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { useLocale, addLocaleToPathLocaleInFront } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { Icon, category as iconCategory, menu as iconMenu } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useRef } from 'react';
import { CategoryPillNavigation } from 'calypso/components/category-pill-navigation';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { PatternsCopyPasteInfo } from 'calypso/my-sites/patterns/components/copy-paste-info';
import { PatternsGetStarted } from 'calypso/my-sites/patterns/components/get-started';
import { PatternsHeader } from 'calypso/my-sites/patterns/components/header';
import { PatternsPageViewTracker } from 'calypso/my-sites/patterns/components/page-view-tracker';
import { PatternsDocumentHead } from 'calypso/my-sites/patterns/components/patterns-document-head';
import { PatternsSearchField } from 'calypso/my-sites/patterns/components/search-field';
import { usePatternsContext } from 'calypso/my-sites/patterns/context';
import { usePatternCategories } from 'calypso/my-sites/patterns/hooks/use-pattern-categories';
import { usePatterns } from 'calypso/my-sites/patterns/hooks/use-patterns';
import { filterPatternsByTerm } from 'calypso/my-sites/patterns/lib/filter-patterns-by-term';
import { getTracksPatternType } from 'calypso/my-sites/patterns/lib/get-tracks-pattern-type';
import { getCategoryUrlPath } from 'calypso/my-sites/patterns/paths';
import {
	PatternTypeFilter,
	PatternView,
	type Category,
	type CategoryGalleryFC,
	type Pattern,
	type PatternGalleryFC,
} from 'calypso/my-sites/patterns/types';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getUserSetting from 'calypso/state/selectors/get-user-setting';

import './style.scss';

// We use this unstyled Emotion component simply to prevent errors related to the use of Emotion's
// `useCx` hook in `ToggleGroupControl`
const PatternLibraryBody = styled.div``;

export const patternFiltersClassName = 'pattern-library__filters';

function filterPatternsByType( patterns: Pattern[], type: PatternTypeFilter ) {
	return patterns.filter( ( pattern ) => {
		const categorySlugs = Object.keys( pattern.categories );
		const isPage = categorySlugs.includes( 'page' );

		return type === PatternTypeFilter.PAGES ? isPage : ! isPage;
	} );
}

// We intentionally disregard grid view when copying the pattern permalink. Our assumption is that
// it will be more confusing for users to land in grid view when they have a single-pattern permalink
function getPatternPermalink(
	pattern: Pattern,
	activeCategory: string,
	patternTypeFilter: PatternTypeFilter,
	categories: Category[]
) {
	// Get the first pattern category that is also included in the `usePatternCategories` data
	const patternCategory = Object.keys( pattern.categories ).find( ( categorySlug ) =>
		categories.find( ( { name } ) => name === categorySlug )
	);
	const pathname = getCategoryUrlPath( activeCategory || patternCategory || '', patternTypeFilter );

	const url = new URL( pathname, location.origin );
	url.hash = `#pattern-${ pattern.ID }`;
	return url.toString();
}

// Scroll to anchoring position of category pill navigation element
function scrollToPatternView( stickyFiltersElement: HTMLDivElement, onlyIfBelowThreshold = false ) {
	const coords = stickyFiltersElement.getBoundingClientRect();
	const style = getComputedStyle( stickyFiltersElement );
	const parsedTop = /(\d+(\.\d+)?)px/.exec( style.top );
	const topStyle = parseFloat( parsedTop?.[ 1 ] ?? '0' );

	if ( onlyIfBelowThreshold && coords.top > topStyle ) {
		return;
	}

	stickyFiltersElement.style.position = 'static';

	requestAnimationFrame( () => {
		const staticCoords = stickyFiltersElement.getBoundingClientRect();
		stickyFiltersElement.style.removeProperty( 'position' );

		window.scrollBy( {
			behavior: 'smooth',
			top: staticCoords.top,
		} );
	} );
}

type PatternLibraryProps = {
	categoryGallery: CategoryGalleryFC;
	patternGallery: PatternGalleryFC;
};

export const PatternLibrary = ( {
	categoryGallery: CategoryGallery,
	patternGallery: PatternGallery,
}: PatternLibraryProps ) => {
	const locale = useLocale();
	const translate = useTranslate();
	const navRef = useRef< HTMLDivElement >( null );
	const { category, searchTerm, isGridView, patternTypeFilter, referrer } = usePatternsContext();

	const { data: categories = [] } = usePatternCategories( locale );
	const { data: patterns = [], isFetching: isFetchingPatterns } = usePatterns( locale, category, {
		select( patterns ) {
			const patternsByType = filterPatternsByType( patterns, patternTypeFilter );
			return filterPatternsByTerm( patternsByType, searchTerm );
		},
	} );

	const isLoggedIn = useSelector( isUserLoggedIn );
	const isDevAccount = useSelector( ( state ) => getUserSetting( state, 'is_dev_account' ) );

	const recordClickEvent = (
		tracksEventName: string,
		view?: PatternView,
		typeFilter?: PatternTypeFilter
	) => {
		recordTracksEvent( tracksEventName, {
			category,
			search_term: searchTerm || undefined,
			is_logged_in: isLoggedIn,
			type: getTracksPatternType( typeFilter ),
			user_is_dev_account: isDevAccount ? '1' : '0',
			view,
		} );
	};

	const currentView = isGridView ? 'grid' : 'list';

	const handleViewChange = ( view: PatternView ) => {
		if ( currentView === view ) {
			return;
		}

		recordClickEvent( 'calypso_pattern_library_view_switch', view, patternTypeFilter );

		const url = new URL( window.location.href );
		url.searchParams.delete( 'grid' );

		if ( view === 'grid' ) {
			url.searchParams.set( 'grid', '1' );
		}

		// Removing the origin ensures that a full refresh is not attempted
		page( url.href.replace( url.origin, '' ) );
	};

	// If the user has scrolled below the anchoring position of the category pill navigation then we
	// scroll back up when the category changes
	useEffect( () => {
		if ( navRef.current ) {
			scrollToPatternView( navRef.current, true );
		}
	}, [ category ] );

	// Scroll to anchoring position of category pill navigation when the search form is submitted
	useEffect( () => {
		if ( navRef.current && searchTerm ) {
			scrollToPatternView( navRef.current );
		}
	}, [ searchTerm ] );

	const [ isSticky, setIsSticky ] = useState( false );
	const prevNavTopValue = useRef( 0 );

	useEffect( () => {
		const handleScroll = () => {
			if ( ! navRef.current ) {
				return;
			}

			const navbarPosition = navRef.current.getBoundingClientRect().top;

			setIsSticky( navbarPosition === prevNavTopValue.current );

			prevNavTopValue.current = navbarPosition;
		};

		window.addEventListener( 'scroll', handleScroll, { passive: true } );
		return () => {
			window.removeEventListener( 'scroll', handleScroll );
		};
	}, [] );

	const categoryObject = categories?.find( ( { name } ) => name === category );

	const categoryNavList = categories.map( ( category ) => {
		const patternTypeFilterFallback =
			category.pagePatternCount === 0 ? PatternTypeFilter.REGULAR : patternTypeFilter;

		return {
			id: category.name,
			label: category.label,
			link:
				getCategoryUrlPath( category.name, patternTypeFilterFallback, false ) +
				( isGridView ? '?grid=1' : '' ),
		};
	} );

	const isHomePage = ! category && ! searchTerm;
	const patternGalleryKey = searchTerm
		? `${ searchTerm }-${ category }-${ patternTypeFilter }`
		: `${ category }-${ patternTypeFilter }`;

	return (
		<>
			<PatternsPageViewTracker
				category={ category }
				patternTypeFilter={ patternTypeFilter }
				view={ currentView }
				key={ `${ category }-tracker` }
				searchTerm={ searchTerm }
				referrer={ referrer }
				patternsCount={ ! isFetchingPatterns ? patterns.length : undefined }
			/>

			<PatternsDocumentHead category={ category } />

			<PatternsHeader
				description={ translate(
					'Dive into hundreds of expertly designed, fully responsive layouts, and bring any kind of site to life, faster.'
				) }
				title={ translate( "It's Easier With Patterns" ) }
			/>

			<div className="pattern-library__wrapper">
				<div
					className={ classNames( patternFiltersClassName, {
						'pattern-library__filters--sticky': isSticky,
					} ) }
					ref={ navRef }
				>
					<div className="pattern-library__filters-inner">
						<CategoryPillNavigation
							selectedCategoryId={ category }
							buttons={ [
								{
									icon: <Icon icon={ iconCategory } size={ 26 } />,
									label: translate( 'All Categories' ),
									link: addLocaleToPathLocaleInFront( '/patterns' ),
									isActive: isHomePage,
								},
							] }
							categories={ categoryNavList }
						/>

						<div className="pattern-library__body-search">
							<PatternsSearchField isCollapsible />
						</div>
					</div>
				</div>

				{ isHomePage && (
					<CategoryGallery
						title={ translate( 'Ship faster, ship more', {
							comment:
								'Heading text for a section in the Pattern Library with links to block pattern categories',
							textOnly: true,
						} ) }
						description={ translate(
							'Choose from a library of beautiful, functional design patterns to build exactly the pages you need—or your client needs—in no time.'
						) }
						categories={ categories }
						patternTypeFilter={ PatternTypeFilter.REGULAR }
					/>
				) }

				{ ! isHomePage && (
					<PatternLibraryBody className="pattern-library">
						<div className="pattern-library__header">
							<h1 className="pattern-library__title">
								{ searchTerm &&
									translate( '%(count)d pattern', '%(count)d patterns', {
										count: patterns.length,
										args: { count: patterns.length },
									} ) }
								{ ! searchTerm &&
									patternTypeFilter === PatternTypeFilter.PAGES &&
									translate( 'Page Layouts', {
										comment: 'Refers to block patterns that contain entire page layouts',
									} ) }
								{ ! searchTerm &&
									patternTypeFilter === PatternTypeFilter.REGULAR &&
									translate( 'Patterns', {
										comment: 'Refers to block patterns',
									} ) }
							</h1>

							{ category && !! categoryObject?.pagePatternCount && (
								<ToggleGroupControl
									className="pattern-library__toggle--pattern-type"
									isBlock
									label=""
									onChange={ ( value ) => {
										const href =
											getCategoryUrlPath( category, value as PatternTypeFilter ) +
											( isGridView ? '?grid=1' : '' );
										recordClickEvent(
											'calypso_pattern_library_type_switch',
											currentView,
											value as PatternTypeFilter
										);
										page( href );
									} }
									value={ patternTypeFilter }
								>
									<ToggleGroupControlOption
										className="pattern-library__toggle-option"
										label={ translate( 'Patterns', {
											comment: 'Refers to block patterns',
											textOnly: true,
										} ) }
										value={ PatternTypeFilter.REGULAR }
									/>
									<ToggleGroupControlOption
										className="pattern-library__toggle-option"
										label={ translate( 'Page Layouts', {
											comment: 'Refers to block patterns that contain entire page layouts',
											textOnly: true,
										} ) }
										value={ PatternTypeFilter.PAGES }
									/>
								</ToggleGroupControl>
							) }

							<ToggleGroupControl
								className="pattern-library__toggle--view"
								label=""
								isBlock
								value={ isGridView ? 'grid' : 'list' }
							>
								<ToggleGroupControlOption
									className="pattern-library__toggle-option--list-view"
									label={ ( <Icon icon={ iconMenu } size={ 20 } /> ) as unknown as string }
									value="list"
									onClick={ () => handleViewChange( 'list' ) }
								/>
								<ToggleGroupControlOption
									className="pattern-library__toggle-option--grid-view"
									label={ ( <Icon icon={ iconCategory } size={ 20 } /> ) as unknown as string }
									value="grid"
									onClick={ () => handleViewChange( 'grid' ) }
								/>
							</ToggleGroupControl>
						</div>

						<PatternGallery
							category={ category }
							getPatternPermalink={ ( pattern ) =>
								getPatternPermalink( pattern, category, patternTypeFilter, categories )
							}
							isGridView={ isGridView }
							key={ `pattern-gallery-${ patternGalleryKey }` }
							patterns={ patterns }
							patternTypeFilter={ patternTypeFilter }
						/>

						{ searchTerm && ! patterns.length && category && (
							<div className="pattern-gallery__body-no-search-results">
								<Button
									className="pattern-gallery__search-all-categories"
									onClick={ () => {
										recordClickEvent( 'calypso_pattern_library_search_in_all' );
										page( `/patterns${ window.location.search }` );
									} }
								>
									{ translate( 'Search in all categories', {
										comment: 'Button to make search of patterns in all categories',
									} ) }
								</Button>
							</div>
						) }
					</PatternLibraryBody>
				) }

				{ isHomePage && <PatternsCopyPasteInfo /> }

				{ isHomePage && (
					<CategoryGallery
						title={ translate( 'Beautifully curated page layouts', {
							comment:
								'Heading text for a section in the Pattern Library with links to block pattern categories containing page layouts',
							textOnly: true,
						} ) }
						description={ translate(
							'Start even faster with ready-to-use pages and preassembled patterns. Then tweak the design until it’s just right.'
						) }
						categories={ categories?.filter( ( c ) => c.pagePatternCount ) }
						patternTypeFilter={ PatternTypeFilter.PAGES }
					/>
				) }
			</div>

			<PatternsGetStarted />
		</>
	);
};
