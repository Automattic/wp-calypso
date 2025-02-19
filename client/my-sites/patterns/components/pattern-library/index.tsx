import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { useLocale, addLocaleToPathLocaleInFront } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { Icon, category as iconCategory } from '@wordpress/icons';
import clsx from 'clsx';
import { Substitution, useTranslate } from 'i18n-calypso';
import { useState, useEffect, useRef } from 'react';
import { CategoryPillNavigation } from 'calypso/components/category-pill-navigation';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { PatternsCopyPasteInfo } from 'calypso/my-sites/patterns/components/copy-paste-info';
import { PatternsGetStarted } from 'calypso/my-sites/patterns/components/get-started';
import { PatternsHeader } from 'calypso/my-sites/patterns/components/header';
import { PatternsPageViewTracker } from 'calypso/my-sites/patterns/components/page-view-tracker';
import { ReadymadeTemplates } from 'calypso/my-sites/patterns/components/readymade-templates';
import { PatternsSearchField } from 'calypso/my-sites/patterns/components/search-field';
import { TypeToggle } from 'calypso/my-sites/patterns/components/type-toggle';
import { ViewToggle } from 'calypso/my-sites/patterns/components/view-toggle';
import { usePatternsContext } from 'calypso/my-sites/patterns/context';
import { usePatternCategories } from 'calypso/my-sites/patterns/hooks/use-pattern-categories';
import { usePatterns } from 'calypso/my-sites/patterns/hooks/use-patterns';
import { useReadymadeTemplates } from 'calypso/my-sites/patterns/hooks/use-readymade-templates';
import { useRecordPatternsEvent } from 'calypso/my-sites/patterns/hooks/use-record-patterns-event';
import { filterPatternsByTerm } from 'calypso/my-sites/patterns/lib/filter-patterns-by-term';
import { filterPatternsByType } from 'calypso/my-sites/patterns/lib/filter-patterns-by-type';
import { getPatternPermalink } from 'calypso/my-sites/patterns/lib/get-pattern-permalink';
import { getTracksPatternType } from 'calypso/my-sites/patterns/lib/get-tracks-pattern-type';
import { getCategoryUrlPath, getOnboardingUrl } from 'calypso/my-sites/patterns/paths';
import {
	PatternTypeFilter,
	PatternView,
	CategoryGalleryFC,
	PatternGalleryFC,
} from 'calypso/my-sites/patterns/types';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getUserSetting from 'calypso/state/selectors/get-user-setting';

import './style.scss';

// We use this unstyled Emotion component simply to prevent errors related to the use of Emotion's
// `useCx` hook in `ToggleGroupControl`
const PatternLibraryBody = styled.div``;

export const patternFiltersClassName = 'pattern-library__filters';

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

function scrollToSection( element: HTMLDivElement, scrollBehavior: ScrollBehavior = 'smooth' ) {
	requestAnimationFrame( () => {
		element.scrollIntoView( {
			behavior: scrollBehavior,
			block: 'center',
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
	const readymadeTemplateSectionRef = useRef< HTMLDivElement >( null );

	const { recordPatternsEvent } = useRecordPatternsEvent();
	const { category, searchTerm, section, isGridView, patternTypeFilter, patternPermalinkId } =
		usePatternsContext();

	const { data: categories = [] } = usePatternCategories( locale );
	const { data: rawPatterns = [], isFetching: isFetchingPatterns } = usePatterns(
		locale,
		category,
		{ enabled: Boolean( category || searchTerm ) }
	);
	const { data: readymadeTemplates = [] } = useReadymadeTemplates();

	const patterns = searchTerm
		? filterPatternsByTerm( rawPatterns, searchTerm )
		: filterPatternsByType( rawPatterns, patternTypeFilter );

	let patternPermalinkName;

	if ( patternPermalinkId && ! isFetchingPatterns ) {
		patternPermalinkName = patterns.find( ( pattern ) => pattern.ID === patternPermalinkId )?.name;
	}

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

	useEffect( () => {
		if (
			'readymade-templates-section' === section &&
			readymadeTemplateSectionRef.current &&
			! searchTerm
		) {
			scrollToSection( readymadeTemplateSectionRef.current, 'instant' );
		}
	}, [ searchTerm, section ] );

	// `calypso-router` has trouble with the onboarding URL we use. This code prevents click
	// events on onboarding links from propagating to the `calypso-router` event listener,
	// which fixes the problem.
	useEffect( () => {
		const onboardingUrl = getOnboardingUrl( locale, isLoggedIn );

		function stopPropagationOnClick( event: MouseEvent ) {
			if (
				event.target instanceof HTMLAnchorElement &&
				event.target.getAttribute( 'href' ) === onboardingUrl
			) {
				event.stopPropagation();
			}
		}

		document.addEventListener( 'click', stopPropagationOnClick, { capture: true } );

		return () => {
			document.removeEventListener( 'click', stopPropagationOnClick );
		};
	}, [ locale, isLoggedIn ] );

	const categoryObject = categories?.find( ( { name } ) => name === category );
	const shouldDisplayPatternTypeToggle =
		category && ! searchTerm && !! categoryObject?.pagePatternCount;

	const categoryNavList = categories.map( ( category ) => {
		const patternTypeFilterFallback =
			category.pagePatternCount === 0 ? PatternTypeFilter.REGULAR : patternTypeFilter;

		return {
			id: category.name,
			label: category.label,
			link: getCategoryUrlPath( category.name, patternTypeFilterFallback, false, isGridView ),
		};
	} );

	const isHomePage = ! category && ! searchTerm;
	const patternGalleryKey = searchTerm
		? `${ searchTerm }-${ category }-${ patternTypeFilter }`
		: `${ category }-${ patternTypeFilter }`;

	let mainHeading: Substitution = '';

	if ( searchTerm && isFetchingPatterns && ! patterns.length ) {
		// Non-breaking space
		mainHeading = '\u00A0';
	} else if ( searchTerm ) {
		mainHeading = translate( '%(count)d pattern', '%(count)d patterns', {
			count: patterns.length,
			args: { count: patterns.length },
		} );
	} else if ( patternTypeFilter === PatternTypeFilter.PAGES ) {
		mainHeading = translate( 'Page Layouts', {
			comment: 'Refers to block patterns that contain entire page layouts',
		} );
	} else if ( patternTypeFilter === PatternTypeFilter.REGULAR ) {
		mainHeading = translate( 'Patterns', {
			comment: 'Refers to block patterns',
		} );
	}

	return (
		<>
			{ isHomePage ? (
				<PatternsPageViewTracker
					patternsCount={ ! isFetchingPatterns ? patterns.length : undefined }
				/>
			) : (
				<PatternsPageViewTracker
					patternPermalinkName={ patternPermalinkName }
					view={ currentView }
					patternsCount={ ! isFetchingPatterns ? patterns.length : undefined }
				/>
			) }

			<PatternsHeader />

			<div className="pattern-library__wrapper">
				<div
					className={ clsx( patternFiltersClassName, {
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
									id: 'all',
									label: translate( 'All Categories' ),
									link: addLocaleToPathLocaleInFront( '/patterns' ),
									isActive: ! category,
								},
							] }
							categories={ categoryNavList }
							onSelect={ ( selectedId ) =>
								recordPatternsEvent( 'calypso_pattern_library_filter', { category: selectedId } )
							}
						/>

						<div className="pattern-library__body-search">
							<PatternsSearchField isCollapsible />
						</div>
					</div>
				</div>

				{ isHomePage && (
					<CategoryGallery
						title={ translate( 'Build anything with patterns', {
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
								className={ clsx( 'pattern-library__title', {
									'pattern-library__title--search': searchTerm,
								} ) }
							>
								{ mainHeading }
							</h1>

							{ shouldDisplayPatternTypeToggle && (
								<TypeToggle
									onChange={ ( type ) => {
										recordClickEvent( 'calypso_pattern_library_type_switch', currentView, type );
									} }
								/>
							) }

							<ViewToggle
								onChange={ ( view ) => {
									recordClickEvent(
										'calypso_pattern_library_view_switch',
										view,
										patternTypeFilter
									);
								} }
							/>
						</div>

						<PatternGallery
							category={ category }
							displayPlaceholder={ isFetchingPatterns && ! patterns.length }
							getPatternPermalink={ ( pattern ) =>
								getPatternPermalink( pattern, category, categories )
							}
							isGridView={ isGridView }
							key={ `pattern-gallery-${ patternGalleryKey }` }
							patterns={ patterns }
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

				{ isHomePage && (
					<PatternsCopyPasteInfo
						theme={ isEnabled( 'readymade-templates/showcase' ) ? 'gray' : 'dark' }
					/>
				) }

				{ isHomePage && (
					<>
						<CategoryGallery
							title={ translate( 'Beautiful, curated page layouts', {
								comment:
									'Heading text for a section in the Pattern Library with links to block pattern categories containing page layouts',
								textOnly: true,
							} ) }
							description={ translate(
								'Our page layouts are exactly what you need to easily create professional-looking pages using preassembled patterns.'
							) }
							categories={ categories?.filter( ( c ) => c.pagePatternCount ) }
							patternTypeFilter={ PatternTypeFilter.PAGES }
						/>
						{ isEnabled( 'readymade-templates/showcase' ) && (
							<ReadymadeTemplates
								readymadeTemplates={ readymadeTemplates }
								forwardRef={ readymadeTemplateSectionRef }
							/>
						) }
					</>
				) }
			</div>

			<PatternsGetStarted theme={ isEnabled( 'readymade-templates/showcase' ) ? 'blue' : 'dark' } />
		</>
	);
};
