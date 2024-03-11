import { BlockRendererProvider, PatternsRendererProvider } from '@automattic/block-renderer';
import classNames from 'classnames';
import {
	CategoryGalleryServer,
	COLUMN_COUNTS,
} from 'calypso/my-sites/patterns/components/category-gallery/server';
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
	description,
	patternType,
	title,
} ) => {
	const patternIdsByCategory = {
		first: categories?.map( ( { previewPattern } ) => `${ previewPattern?.ID }` ) ?? [],
	};

	return (
		<BlockRendererProvider
			siteId={ RENDERER_SITE_ID }
			placeholder={
				<CategoryGalleryServer
					categories={ categories }
					description={ description }
					patternType={ patternType }
					title={ title }
				/>
			}
		>
			<PatternsRendererProvider
				patternIdsByCategory={ patternIdsByCategory }
				shouldShufflePosts={ false }
				siteId={ RENDERER_SITE_ID }
			>
				<PatternsSection title={ title } description={ description }>
					<div
						className="patterns-category-gallery"
						style={ { '--column-count': COLUMN_COUNTS[ patternType ] } as React.CSSProperties }
					>
						{ categories?.map( ( category ) => (
							<LocalizedLink
								className="patterns-category-gallery__item"
								href={ `/patterns/${ category.name }` }
								key={ category.name }
							>
								<div
									className={ classNames( 'patterns-category-gallery__item-preview', {
										'patterns-category-gallery__item-preview_page-layouts': patternType === 'pages',
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
