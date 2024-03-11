import { BlockRendererProvider, PatternsRendererProvider } from '@automattic/block-renderer';
import classNames from 'classnames';
import { CategoryGalleryServer } from 'calypso/my-sites/patterns/components/category-gallery/server';
import { LocalizedLink } from 'calypso/my-sites/patterns/components/localized-link';
import {
	DESKTOP_VIEWPORT_WIDTH,
	PatternPreview,
} from 'calypso/my-sites/patterns/components/pattern-preview';
import { PatternsSection } from 'calypso/my-sites/patterns/components/section';
import { RENDERER_SITE_ID } from 'calypso/my-sites/patterns/controller';
import type { CategoryGalleryFC } from 'calypso/my-sites/patterns/types';

import './style.scss';

export const CategoryGalleryClient: CategoryGalleryFC = ( {
	categories,
	columnCount = 4,
	description,
	title,
} ) => {
	const patternIdsByCategory = {
		intro: categories?.map( ( { previewPattern } ) => `${ previewPattern?.ID }` ) ?? [],
	};

	if ( ! categories ) {
		return null;
	}

	return (
		<BlockRendererProvider
			siteId={ RENDERER_SITE_ID }
			placeholder={ <CategoryGalleryServer description={ description } title={ title } /> }
		>
			<PatternsRendererProvider
				patternIdsByCategory={ patternIdsByCategory }
				shouldShufflePosts={ false }
				siteId={ RENDERER_SITE_ID }
			>
				<PatternsSection title={ title } description={ description }>
					<div
						className="patterns-category-gallery"
						style={ { '--column-count': columnCount } as React.CSSProperties }
					>
						{ categories.map( ( category ) => (
							<LocalizedLink
								className="patterns-category-gallery__item"
								href={ `/patterns/${ category.name }` }
								key={ category.name }
							>
								<div
									className={ classNames( 'patterns-category-gallery__item-preview', {
										'patterns-category-gallery__item-preview_mirrored': category.name === 'footer',
									} ) }
								>
									<div className="patterns-category-gallery__item-preview-inner">
										<PatternPreview
											isCategoryPreview
											pattern={ category.previewPattern }
											viewportWidth={ DESKTOP_VIEWPORT_WIDTH }
										/>
									</div>
								</div>

								<div className="patterns-category-gallery__item-name">{ category.label }</div>
								<div className="patterns-category-gallery__item-count">
									{ category.count } patterns
								</div>
							</LocalizedLink>
						) ) }
					</div>
				</PatternsSection>
			</PatternsRendererProvider>
		</BlockRendererProvider>
	);
};
