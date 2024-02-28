import { BlockRendererProvider, PatternsRendererProvider } from '@automattic/block-renderer';
import { useLocale } from '@automattic/i18n-utils';
import classNames from 'classnames';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import { PatternPreview } from 'calypso/my-sites/patterns/components/pattern-preview';
import { PatternPreviewPlaceholder } from 'calypso/my-sites/patterns/components/pattern-preview-placeholder';
import { usePatternCategories } from 'calypso/my-sites/patterns/hooks/use-pattern-categories';
import { usePatterns } from 'calypso/my-sites/patterns/hooks/use-patterns';

import './style.scss';

const RENDERER_SITE_ID = '226011606'; // assemblerdemo

type Props = {
	category: string;
	isGridView?: boolean;
};

export default function Patterns( { category, isGridView }: Props ) {
	const locale = useLocale();

	const { data: categories } = usePatternCategories( locale, Number( RENDERER_SITE_ID ) );
	const { data: patterns } = usePatterns( locale, category, {
		enabled: !! category,
	} );

	const patternIdsByCategory = {
		intro: patterns?.map( ( { ID } ) => `${ ID }` ) ?? [],
	};

	return (
		<Main isLoggedOut fullWidthLayout>
			<DocumentHead title="WordPress Patterns" />
			<h1>Build your perfect site with patterns</h1>

			<ul className="pattern-categories">
				{ categories?.map( ( category ) => (
					<li className="pattern-category" key={ category.name }>
						<a href={ `/patterns/${ category.name }` }>{ category.label }</a>
					</li>
				) ) }
			</ul>

			<BlockRendererProvider
				siteId={ RENDERER_SITE_ID }
				placeholder={
					<div className="patterns">
						{ patterns?.map( ( pattern ) => (
							<PatternPreviewPlaceholder key={ pattern.ID } pattern={ pattern } />
						) ) }
					</div>
				}
			>
				<PatternsRendererProvider
					patternIdsByCategory={ patternIdsByCategory }
					shouldShufflePosts={ false }
					siteId={ RENDERER_SITE_ID }
				>
					<div className={ classNames( 'patterns', { patterns_grid: isGridView } ) }>
						{ patterns?.map( ( pattern ) => (
							<PatternPreview isGridView={ isGridView } key={ pattern.ID } pattern={ pattern } />
						) ) }
					</div>
				</PatternsRendererProvider>
			</BlockRendererProvider>
		</Main>
	);
}
