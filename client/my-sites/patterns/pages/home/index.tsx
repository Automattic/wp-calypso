import { useLocale } from '@automattic/i18n-utils';
import DocumentHead from 'calypso/components/data/document-head';
import { PatternsCopyPasteInfo } from 'calypso/my-sites/patterns/components/copy-paste-info';
import { PatternsGetStarted } from 'calypso/my-sites/patterns/components/get-started';
import { PatternsHeader } from 'calypso/my-sites/patterns/components/header';
import { usePatternCategories } from 'calypso/my-sites/patterns/hooks/use-pattern-categories';
import {
	usePatternSearchTerm,
	filterPatternsByTerm,
} from 'calypso/my-sites/patterns/hooks/use-pattern-search-term';
import { usePatterns } from 'calypso/my-sites/patterns/hooks/use-patterns';
import {
	PatternTypeFilter,
	type CategoryGalleryFC,
	type PatternGalleryFC,
} from 'calypso/my-sites/patterns/types';

import './style.scss';

type PatternsHomePageProps = {
	categoryGallery: CategoryGalleryFC;
	isGridView?: boolean;
	patternGallery: PatternGalleryFC;
};

export const PatternsHomePage = ( {
	categoryGallery: CategoryGallery,
	isGridView,
	patternGallery: PatternGallery,
}: PatternsHomePageProps ) => {
	const locale = useLocale();

	const [ searchTerm, setSearchTerm ] = usePatternSearchTerm();
	const { data: categories } = usePatternCategories( locale );
	const { data: patterns = [] } = usePatterns( locale, '', {
		enabled: Boolean( searchTerm ),
		select: ( patterns ) => filterPatternsByTerm( patterns, searchTerm ),
	} );

	return (
		<>
			<DocumentHead title="WordPress Patterns- Home" />

			<PatternsHeader
				description="Hundreds of expertly designed, fully responsive patterns allow you to craft a beautiful site in minutes."
				initialSearchTerm={ searchTerm }
				onSearch={ ( query ) => {
					setSearchTerm( query );
				} }
				title="Build your perfect site with patterns"
			/>

			<CategoryGallery
				title="Ship faster with patterns"
				description="Choose from a huge library of patterns to build any page you need."
				categories={ categories?.filter( ( c ) => c.regularPatternCount ) }
				patternTypeFilter={ PatternTypeFilter.REGULAR }
			/>

			{ searchTerm && <PatternGallery patterns={ patterns } isGridView={ isGridView } /> }

			<PatternsCopyPasteInfo />

			<CategoryGallery
				title="Beautifully curated page layouts"
				description="Entire pages built of patterns, ready to be added to your site."
				categories={ categories?.filter( ( c ) => c.pagePatternCount ) }
				patternTypeFilter={ PatternTypeFilter.PAGES }
			/>

			<PatternsGetStarted />
		</>
	);
};
