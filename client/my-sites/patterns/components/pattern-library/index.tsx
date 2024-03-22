import page from '@automattic/calypso-router';
import { useLocale, addLocaleToPathLocaleInFront } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import {
	Icon,
	starEmpty as iconStar,
	category as iconCategory,
	menu as iconMenu,
} from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import { CategoryPillNavigation } from 'calypso/components/category-pill-navigation';
import DocumentHead from 'calypso/components/data/document-head';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { PatternsCopyPasteInfo } from 'calypso/my-sites/patterns/components/copy-paste-info';
import { PatternsGetStarted } from 'calypso/my-sites/patterns/components/get-started';
import { PatternsHeader } from 'calypso/my-sites/patterns/components/header';
import { PatternsPageViewTracker } from 'calypso/my-sites/patterns/components/page-view-tracker';
import { getCategoryUrlPath } from 'calypso/my-sites/patterns/controller';
import { usePatternCategories } from 'calypso/my-sites/patterns/hooks/use-pattern-categories';
import {
	usePatternSearchTerm,
	filterPatternsByTerm,
} from 'calypso/my-sites/patterns/hooks/use-pattern-search-term';
import { usePatterns } from 'calypso/my-sites/patterns/hooks/use-patterns';
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
	searchTerm?: string;
};

export const PatternLibrary = ( {
	category,
	categoryGallery: CategoryGallery,
	isGridView,
	patternGallery: PatternGallery,
	patternTypeFilter,
	searchTerm: urlQuerySearchTerm = '',
}: PatternLibraryProps ) => {
	const locale = useLocale();
	const translate_not_yet = useTranslate();

	// Helps prevent resetting the search input if a search term was provided through the URL
	const isInitialRender = useRef( true );
	// Helps reset the search input when navigating between categories
	const [ searchFormKey, setSearchFormKey ] = useState( category );

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

	const currentView = isGridView ? 'grid' : 'list';

	const handleViewChange = ( view: PatternView ) => {
		if ( currentView === view ) {
			return;
		}

		recordTracksEvent( 'calypso_pattern_library_view_switch', {
			category,
			is_logged_in: isLoggedIn,
			type: getTracksPatternType( patternTypeFilter ),
			user_is_dev_account: isDevAccount ? '1' : '0',
			view,
		} );

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

	// Resets the search term whenever the category changes
	useEffect( () => {
		if ( isInitialRender.current ) {
			isInitialRender.current = false;
			return;
		}

		setSearchTerm( '' );
		setSearchFormKey( category );
	}, [ category ] );

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
			/>

			<DocumentHead title={ translate_not_yet( 'WordPress Patterns - Category' ) } />

			<PatternsHeader
				description={ translate_not_yet(
					'Dive into hundreds of expertly designed, fully responsive layouts, and bring any kind of site to life, faster.'
				) }
				initialSearchTerm={ searchTerm }
				key={ `${ searchFormKey }-search` }
				onSearch={ ( query ) => {
					setSearchTerm( query );
				} }
				title={ translate_not_yet( 'It’s Easier With Patterns' ) }
			/>

			<div className="pattern-library__pill-navigation">
				<CategoryPillNavigation
					selectedCategoryId={ category }
					buttons={ [
						{
							icon: <Icon icon={ iconStar } size={ 30 } />,
							label: translate_not_yet( 'Discover' ),
							link: addLocaleToPathLocaleInFront( '/patterns' ),
							isActive: isHomePage,
						},
						{
							icon: <Icon icon={ iconCategory } size={ 26 } />,
							label: translate_not_yet( 'All Categories' ),
							link: '/222',
						},
					] }
					categories={ categoryNavList }
				/>
			</div>

			{ isHomePage && (
				<CategoryGallery
					title={ translate_not_yet( 'Ship faster, ship more' ) }
					description={ translate_not_yet(
						'Choose from a library of beautiful, functional design patterns to build exactly the page you—or your client—need, in no time.'
					) }
					categories={ categories }
					patternTypeFilter={ PatternTypeFilter.REGULAR }
				/>
			) }

			{ ! isHomePage && (
				<PatternLibraryBody className="pattern-library">
					<div className="pattern-library__header">
						<h1 className="pattern-library__title">
							{ searchTerm
								? translate_not_yet( '%(count)d pattern', '%(count)d patterns', {
										count: patterns.length,
										args: { count: patterns.length },
								  } )
								: translate_not_yet( 'Patterns' ) }
						</h1>

						{ category && (
							<ToggleGroupControl
								className="pattern-library__toggle--pattern-type"
								isBlock
								label=""
								onChange={ ( value ) => {
									const href =
										getCategoryUrlPath( category, value as PatternTypeFilter ) +
										( isGridView ? '?grid=1' : '' );
									page( href );
								} }
								value={ patternTypeFilter }
							>
								<ToggleGroupControlOption
									className="pattern-library__toggle-option"
									label={ translate_not_yet( 'Patterns' ) }
									value={ PatternTypeFilter.REGULAR }
								/>
								<ToggleGroupControlOption
									className="pattern-library__toggle-option"
									disabled={ categoryObject?.pagePatternCount === 0 }
									label={ translate_not_yet( 'Page layouts' ) }
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
					title={ translate_not_yet( 'Beautifully curated page layouts' ) }
					description={ translate_not_yet(
						'Start even faster with ready-to-use pages and preassembled patterns. Then tweak the design until it’s just right.'
					) }
					categories={ categories?.filter( ( c ) => c.pagePatternCount ) }
					patternTypeFilter={ PatternTypeFilter.PAGES }
				/>
			) }

			<PatternsGetStarted />
		</>
	);
};
