import { BlockRendererProvider, PatternsRendererProvider } from '@automattic/block-renderer';
import classNames from 'classnames';
import { PatternGalleryServer } from 'calypso/my-sites/patterns/components/pattern-gallery/server';
import {
	DESKTOP_VIEWPORT_WIDTH,
	PatternPreview,
} from 'calypso/my-sites/patterns/components/pattern-preview';
import { RENDERER_SITE_ID } from 'calypso/my-sites/patterns/controller';
import type { PatternGalleryFC } from 'calypso/my-sites/patterns/types';

import './style.scss';

export const PatternGalleryClient: PatternGalleryFC = ( { isGridView, patterns = [] } ) => {
	const patternIdsByCategory = {
		first: patterns.map( ( { ID } ) => `${ ID }` ) ?? [],
	};

	return (
		<BlockRendererProvider
			siteId={ RENDERER_SITE_ID }
			placeholder={ <PatternGalleryServer isGridView={ isGridView } patterns={ patterns } /> }
		>
			<PatternsRendererProvider
				patternIdsByCategory={ patternIdsByCategory }
				shouldShufflePosts={ false }
				siteId={ RENDERER_SITE_ID }
			>
				<div className={ classNames( 'patterns', { patterns_grid: isGridView } ) }>
					{ patterns.map( ( pattern ) => (
						<PatternPreview
							key={ pattern.ID }
							pattern={ pattern }
							viewportWidth={ isGridView ? DESKTOP_VIEWPORT_WIDTH : undefined }
						/>
					) ) }
				</div>
			</PatternsRendererProvider>
		</BlockRendererProvider>
	);
};
