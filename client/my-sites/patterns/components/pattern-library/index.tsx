import page from '@automattic/calypso-router';
import { useLocale, addLocaleToPathLocaleInFront } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { Icon, category as iconCategory, menu as iconMenu } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import { CategoryPillNavigation } from 'calypso/components/category-pill-navigation';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { PatternsCopyPasteInfo } from 'calypso/my-sites/patterns/components/copy-paste-info';
import { PatternsGetStarted } from 'calypso/my-sites/patterns/components/get-started';
import { PatternsHeader } from 'calypso/my-sites/patterns/components/header';
import { PatternsPageViewTracker } from 'calypso/my-sites/patterns/components/page-view-tracker';
import { PatternsDocumentHead } from 'calypso/my-sites/patterns/components/patterns-document-head';
import { usePatternCategories } from 'calypso/my-sites/patterns/hooks/use-pattern-categories';
import {
	usePatternSearchTerm,
	filterPatternsByTerm,
} from 'calypso/my-sites/patterns/hooks/use-pattern-search-term';
import { usePatterns } from 'calypso/my-sites/patterns/hooks/use-patterns';
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
import { getTracksPatternType } from '../../lib/get-tracks-pattern-type';

import './style.scss';

// We use this unstyled Emotion component simply to prevent errors related to the use of Emotion's
// `useCx` hook in `ToggleGroupControl`
const PatternLibraryBody = styled.div``;

export const pillNavigationClassName = 'pattern-library__pill-navigation';

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

type PatternLibraryProps = {
	category: string;
	categoryGallery: CategoryGalleryFC;
	isGridView?: boolean;
	patternGallery: PatternGalleryFC;
	patternTypeFilter: PatternTypeFilter;
	referrer?: string;
	searchTerm?: string;
};

export const PatternLibrary = ( {
	category,
	categoryGallery: CategoryGallery,
	isGridView,
	patternGallery: PatternGallery,
	patternTypeFilter,
	referrer,
	searchTerm: urlQuerySearchTerm = '',
}: PatternLibraryProps ) => {
	const locale = useLocale();
	const translate = useTranslate();

	// Helps prevent resetting the search input if a search term was provided through the URL
	const isInitialRender = useRef( true );
	// Helps reset the search input when navigating between categories
	const [ searchFormKey, setSearchFormKey ] = useState( category );
	const navRef = useRef< HTMLDivElement >( null );

	const [ searchTerm, setSearchTerm ] = usePatternSearchTerm( urlQuerySearchTerm );
	const { data: categories = [] } = usePatternCategories( locale );
	const { data: patterns = [] } = usePatterns( locale, category, {
		select( patterns ) {
			const patternsByType = filterPatternsByType( patterns, patternTypeFilter );
			return filterPatternsByTerm( patternsByType, searchTerm );
		},
	} );

	const isLoggedIn = useSelector( isUserLoggedIn );
	const isDevAccount = useSelector( ( state ) => getUserSetting( state, 'is_dev_account' ) );

	const recordClickEvent = (
		tracksEventName: string,
		view: PatternView,
		typeFilter: PatternTypeFilter
	) => {
		recordTracksEvent( tracksEventName, {
			category,
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

	// Resets the search term when navigating from `/patterns?s=lorem` to `/patterns`
	useEffect( () => {
		if ( ! urlQuerySearchTerm ) {
			setSearchTerm( '' );
			setSearchFormKey( Math.random().toString() );
		}
	}, [ urlQuerySearchTerm ] );

	useEffect( () => {
		if ( isInitialRender.current ) {
			isInitialRender.current = false;
			return;
		}

		// Reset the search term when the category changes
		setSearchTerm( '' );
		setSearchFormKey( category );

		// If the user has scrolled below the anchoring position of `.pattern-library__pill-navigation`,
		// then we scroll back up when the category changes
		if ( navRef.current ) {
			const element = navRef.current;
			const coords = element.getBoundingClientRect();
			const style = getComputedStyle( element );
			const parsedTop = /(\d+(\.\d+)?)px/.exec( style.top );
			const topStyle = parseFloat( parsedTop?.[ 1 ] ?? '0' );

			if ( coords.top > topStyle ) {
				return;
			}

			element.style.position = 'static';

			requestAnimationFrame( () => {
				const staticCoords = element.getBoundingClientRect();
				element.style.removeProperty( 'position' );

				window.scrollBy( {
					behavior: 'smooth',
					top: staticCoords.top,
				} );
			} );
		}
	}, [ category ] );

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

	return (
		<>
			<PatternsPageViewTracker
				category={ category }
				patternTypeFilter={ patternTypeFilter }
				view={ currentView }
				key={ `${ category }-tracker` }
				// We pass `urlQuerySearchTerm` instead of `searchTerm` since the former is
				// immediately reset when navigating to a new category, whereas the latter is reset
				// *after* the first render (which triggers an additional, incorrect, page view)
				searchTerm={ urlQuerySearchTerm }
				referrer={ referrer }
			/>

			<PatternsDocumentHead category={ category } />

			<PatternsHeader
				description={ translate(
					'Dive into hundreds of expertly designed, fully responsive layouts, and bring any kind of site to life, faster.'
				) }
				initialSearchTerm={ searchTerm }
				key={ `${ searchFormKey }-search` }
				onSearch={ ( query ) => {
					setSearchTerm( query );
				} }
				title={ translate( "It's Easier With Patterns" ) }
			/>

			<div className="pattern-library__wrapper">
				<div
					className={ classNames( pillNavigationClassName, {
						'pattern-library__pill-navigation--sticky': isSticky,
					} ) }
					ref={ navRef }
				>
					<CategoryPillNavigation
						selectedCategoryId={ category }
						buttons={ [
							{
								icon: <Icon icon={ iconCategory } size={ 26 } />,
								label: translate( 'All Categories' ),
								link: addLocaleToPathLocaleInFront( '/patterns' ),
								isActive: ! category,
							},
						] }
						categories={ categoryNavList }
					/>
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
							<h1
								className={ classNames( 'pattern-library__title', {
									'pattern-library__title--search': searchTerm,
								} ) }
							>
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
							patterns={ patterns }
							patternTypeFilter={ patternTypeFilter }
						/>
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
