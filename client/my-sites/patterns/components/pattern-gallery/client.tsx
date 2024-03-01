import { BlockRendererProvider, PatternsRendererProvider } from '@automattic/block-renderer';
import classNames from 'classnames';
import { PatternPreview } from 'calypso/my-sites/patterns/components/pattern-preview';
import { PatternPreviewPlaceholder } from 'calypso/my-sites/patterns/components/pattern-preview-placeholder';
import { RENDERER_SITE_ID } from 'calypso/my-sites/patterns/controller';
import type { PatternGalleryFC } from 'calypso/my-sites/patterns/types';

import './style.scss';

export const PatternGalleryClient: PatternGalleryFC = ( { isGridView, patterns = [] } ) => {
	const patternIdsByCategory = {
		intro: patterns.map( ( { ID } ) => `${ ID }` ) ?? [],
	};

	return (
		<BlockRendererProvider
			siteId={ RENDERER_SITE_ID }
			placeholder={
				<div className="patterns">
					{ patterns.map( ( pattern ) => (
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
					{ patterns.map( ( pattern ) => (
						<PatternPreview isGridView={ isGridView } key={ pattern.ID } pattern={ pattern } />
					) ) }
				</div>
			</PatternsRendererProvider>
		</BlockRendererProvider>
	);
};
