import { useLocale } from '@automattic/i18n-utils';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import { LocalizedLink } from 'calypso/my-sites/patterns/components/localized-link';
import { RENDERER_SITE_ID } from 'calypso/my-sites/patterns/controller';
import { usePatternCategories } from 'calypso/my-sites/patterns/hooks/use-pattern-categories';
import { usePatterns } from 'calypso/my-sites/patterns/hooks/use-patterns';
import type { PatternGalleryFC } from 'calypso/my-sites/patterns/types';

import './style.scss';

type Props = {
	category: string;
	isGridView?: boolean;
	patternGallery: PatternGalleryFC;
};

export function Patterns( { category, isGridView, patternGallery: PatternGallery }: Props ) {
	const locale = useLocale();

	const { data: categories } = usePatternCategories( locale, RENDERER_SITE_ID );
	const { data: patterns } = usePatterns( locale, category );

	return (
		<Main isLoggedOut fullWidthLayout>
			<DocumentHead title="WordPress Patterns" />
			<h1>Build your perfect site with patterns</h1>

			<ul className="pattern-categories">
				{ categories?.map( ( category ) => (
					<li className="pattern-category" key={ category.name }>
						<LocalizedLink href={ `/patterns/${ category.name }` }>
							{ category.label }
						</LocalizedLink>
					</li>
				) ) }
			</ul>

			<PatternGallery patterns={ patterns } isGridView={ isGridView } />
		</Main>
	);
}
