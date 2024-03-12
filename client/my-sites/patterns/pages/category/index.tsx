import page from '@automattic/calypso-router';
import { useLocale, addLocaleToPathLocaleInFront } from '@automattic/i18n-utils';
import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useEffect, useRef, useState } from 'react';
import { CategoryPillNavigation } from 'calypso/components/category-pill-navigation';
import DocumentHead from 'calypso/components/data/document-head';
import { PatternsGetStarted } from 'calypso/my-sites/patterns/components/get-started';
import { PatternsHeader } from 'calypso/my-sites/patterns/components/header';
import { getCategorySlug } from 'calypso/my-sites/patterns/controller';
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
import ImgGrid from './images/grid.svg';
import ImgStar from './images/star.svg';

import './style.scss';

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
	patternType: PatternTypeFilter;
};

export const PatternsCategoryPage = ( {
	category,
	isGridView,
	patternGallery: PatternGallery,
	patternType,
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
			const patternsByType = filterPatternsByType( patterns, patternType );
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

	const categoryNavList = categories?.map( ( category ) => ( {
		name: category.name || '',
		label: category.label,
		link: getCategorySlug( category.name, patternType, false ),
	} ) );

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
								icon: ImgStar,
								label: 'Discover',
								link: addLocaleToPathLocaleInFront( '/patterns' ),
							},
							{
								icon: ImgGrid,
								label: 'All Categories',
								link: '/222',
							},
						] }
						list={ categoryNavList }
					/>
				</div>
			) }

			<div className="patterns-page-category">
				<div className="patterns-page-category__header">
					<h1 className="patterns-page-category__title">Patterns</h1>

					<ToggleGroupControl
						className="patterns__toggle-type"
						isBlock
						label=""
						onChange={ ( value ) => {
							const href = getCategorySlug( category, value as PatternTypeFilter );
							page( href );
						} }
						value={ patternType }
					>
						<ToggleGroupControlOption value={ PatternTypeFilter.REGULAR } label="Patterns" />
						<ToggleGroupControlOption value={ PatternTypeFilter.PAGES } label="Page layouts" />
					</ToggleGroupControl>

					<ToggleGroupControl label="" isBlock className="patterns__toggle-view" value="patterns">
						<ToggleGroupControlOption
							value="patterns"
							label="List view"
							className="patterns-button__list-view"
						/>
						<ToggleGroupControlOption
							value="layouts"
							label="Grid view"
							className="patterns-button__grid-view"
						/>
					</ToggleGroupControl>
				</div>

				<PatternGallery patterns={ patterns } isGridView={ isGridView } />
			</div>

			<PatternsGetStarted />
		</>
	);
};
