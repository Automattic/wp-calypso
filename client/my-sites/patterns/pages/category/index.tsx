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
import { useEffect, useRef, useState } from 'react';
import { CategoryPillNavigation } from 'calypso/components/category-pill-navigation';
import DocumentHead from 'calypso/components/data/document-head';
import { PatternsGetStarted } from 'calypso/my-sites/patterns/components/get-started';
import { PatternsHeader } from 'calypso/my-sites/patterns/components/header';
import { getCategoryUrlPath } from 'calypso/my-sites/patterns/controller';
import { usePatternCategories } from 'calypso/my-sites/patterns/hooks/use-pattern-categories';
import {
	usePatternSearchTerm,
	filterPatternsByTerm,
} from 'calypso/my-sites/patterns/hooks/use-pattern-search-term';
import { usePatterns } from 'calypso/my-sites/patterns/hooks/use-patterns';
import {
	PatternTypeFilter,
	type Pattern,
	type PatternGalleryFC,
} from 'calypso/my-sites/patterns/types';

import './style.scss';

// We use this unstyled Emotion component simply to prevent errors related to the use of Emotion's
// `useCx` hook in `ToggleGroupControl`
const PatternsCategoryPageBody = styled.div``;

function filterPatternsByType( patterns: Pattern[], type: PatternTypeFilter ) {
	return patterns.filter( ( pattern ) => {
		const categorySlugs = Object.keys( pattern.categories );
		const isPage = categorySlugs.includes( 'page' );

		return type === PatternTypeFilter.PAGES ? isPage : ! isPage;
	} );
}

type PatternsCategoryPageProps = {
	category: string;
	isGridView?: boolean;
	patternGallery: PatternGalleryFC;
	patternTypeFilter: PatternTypeFilter;
};

export const PatternsCategoryPage = ( {
	category,
	isGridView,
	patternGallery: PatternGallery,
	patternTypeFilter,
}: PatternsCategoryPageProps ) => {
	const locale = useLocale();
	// Helps prevent resetting the search input if a search term was provided through the URL
	const isInitialRender = useRef( true );
	// Helps reset the search input when navigating between categories
	const [ searchFormKey, setSearchFormKey ] = useState( category );

	const [ searchTerm, setSearchTerm ] = usePatternSearchTerm();
	const { data: categories } = usePatternCategories( locale );
	const { data: patterns = [] } = usePatterns( locale, category, {
		select( patterns ) {
			const patternsByType = filterPatternsByType( patterns, patternTypeFilter );
			return filterPatternsByTerm( patternsByType, searchTerm );
		},
	} );

	// Resets the search term whenever the category changes
	useEffect( () => {
		if ( isInitialRender.current ) {
			isInitialRender.current = false;
		} else {
			setSearchTerm( '' );
			setSearchFormKey( category );
		}
	}, [ category ] );

	const categoryObject = categories?.find( ( { name } ) => name === category );

	const categoryNavList = categories?.map( ( category ) => {
		const patternTypeFilterFallback =
			category.pagePatternCount === 0 ? PatternTypeFilter.REGULAR : patternTypeFilter;

		return {
			name: category.name || '',
			label: category.label,
			link: getCategoryUrlPath( category.name, patternTypeFilterFallback, false ),
		};
	} );

	return (
		<>
			<DocumentHead title="WordPress Patterns- Category" />

			<PatternsHeader
				description="Introduce yourself or your brand to visitors."
				key={ searchFormKey }
				initialSearchTerm={ searchTerm }
				onSearch={ ( query ) => {
					setSearchTerm( query );
				} }
				title={ category + ' patterns' }
			/>

			{ categoryNavList && (
				<div className="patterns-page-category__pill-navigation">
					<CategoryPillNavigation
						selectedCategory={ category }
						buttons={ [
							{
								icon: <Icon icon={ iconStar } size={ 30 } />,
								label: 'Discover',
								link: addLocaleToPathLocaleInFront( '/patterns' ),
							},
							{
								icon: <Icon icon={ iconCategory } size={ 26 } />,
								label: 'All Categories',
								link: '/222',
							},
						] }
						list={ categoryNavList }
					/>
				</div>
			) }

			<PatternsCategoryPageBody className="patterns-page-category">
				<div className="patterns-page-category__header">
					<h1 className="patterns-page-category__title">Patterns</h1>

					<ToggleGroupControl
						className="patterns-page-category__toggle--pattern-type"
						isBlock
						label=""
						onChange={ ( value ) => {
							const href = getCategoryUrlPath( category, value as PatternTypeFilter );
							page( href );
						} }
						value={ patternTypeFilter }
					>
						<ToggleGroupControlOption
							className="patterns-page-category__toggle-option"
							label="Patterns"
							value={ PatternTypeFilter.REGULAR }
						/>
						<ToggleGroupControlOption
							className="patterns-page-category__toggle-option"
							disabled={ categoryObject?.pagePatternCount === 0 }
							label="Page layouts"
							value={ PatternTypeFilter.PAGES }
						/>
					</ToggleGroupControl>

					<ToggleGroupControl
						className="patterns-page-category__toggle--view"
						label=""
						isBlock
						value="patterns"
					>
						<ToggleGroupControlOption
							className="patterns-page-category__toggle-option--list-view"
							label={ ( <Icon icon={ iconMenu } size={ 20 } /> ) as unknown as string }
							value="list"
						/>
						<ToggleGroupControlOption
							className="patterns-page-category__toggle-option--grid-view"
							label={ ( <Icon icon={ iconCategory } size={ 20 } /> ) as unknown as string }
							value="grid"
						/>
					</ToggleGroupControl>
				</div>

				<PatternGallery patterns={ patterns } isGridView={ isGridView } />
			</PatternsCategoryPageBody>

			<PatternsGetStarted />
		</>
	);
};
