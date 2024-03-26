import { BlockRendererProvider, PatternsRendererProvider } from '@automattic/block-renderer';
import classNames from 'classnames';
import { CategoryGalleryServer } from 'calypso/my-sites/patterns/components/category-gallery/server';
import { LocalizedLink } from 'calypso/my-sites/patterns/components/localized-link';
import {
	DESKTOP_VIEWPORT_WIDTH,
	PatternPreview,
} from 'calypso/my-sites/patterns/components/pattern-preview';
import { PatternsSection } from 'calypso/my-sites/patterns/components/section';
import { RENDERER_SITE_ID } from 'calypso/my-sites/patterns/constants';
import { getCategoryUrlPath } from 'calypso/my-sites/patterns/paths';
import { PatternTypeFilter, type CategoryGalleryFC } from 'calypso/my-sites/patterns/types';

import './style.scss';

export const CategoryGalleryClient: CategoryGalleryFC = ( {
	categories,
	description,
	patternTypeFilter,
	title,
} ) => {
	const patternIdsByCategory = {
		page:
			categories
				?.filter( ( { pagePreviewPattern } ) => pagePreviewPattern )
				.map( ( { pagePreviewPattern } ) => `${ pagePreviewPattern?.ID }` ) ?? [],
		regular:
			categories
				?.filter( ( { regularPreviewPattern } ) => regularPreviewPattern )
				.map( ( { regularPreviewPattern } ) => `${ regularPreviewPattern?.ID }` ) ?? [],
	};

	return (
		<BlockRendererProvider
			siteId={ RENDERER_SITE_ID }
			placeholder={
				<CategoryGalleryServer
					categories={ categories }
					description={ description }
					patternTypeFilter={ patternTypeFilter }
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
						className={ classNames( 'patterns-category-gallery', {
							'is-regular-patterns': patternTypeFilter === PatternTypeFilter.REGULAR,
							'is-page-patterns': patternTypeFilter === PatternTypeFilter.PAGES,
						} ) }
					>
						{ categories?.map( ( category ) => (
							<LocalizedLink
								className="patterns-category-gallery__item"
								href={ getCategoryUrlPath( category.name, patternTypeFilter, false ) }
								key={ category.name }
							>
								<div
									className={ classNames( 'patterns-category-gallery__item-preview', {
										'patterns-category-gallery__item-preview--page-layout':
											patternTypeFilter === PatternTypeFilter.PAGES,
										'patterns-category-gallery__item-preview--mirrored': category.name === 'footer',
									} ) }
								>
									<div className="patterns-category-gallery__item-preview-inner">
										<PatternPreview
											className="pattern-preview--category-gallery"
											pattern={
												patternTypeFilter === PatternTypeFilter.PAGES
													? category.pagePreviewPattern
													: category.regularPreviewPattern
											}
											viewportWidth={ DESKTOP_VIEWPORT_WIDTH }
										/>
									</div>
								</div>

								<div className="patterns-category-gallery__item-name">{ category.label }</div>
								<div className="patterns-category-gallery__item-count">
									{ patternTypeFilter === PatternTypeFilter.PAGES
										? category.pagePatternCount
										: category.regularPatternCount }{ ' ' }
									patterns
								</div>
							</LocalizedLink>
						) ) }
					</div>
				</PatternsSection>
			</PatternsRendererProvider>
		</BlockRendererProvider>
	);
};
