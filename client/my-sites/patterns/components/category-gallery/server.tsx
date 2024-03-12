import classNames from 'classnames';
import { LocalizedLink } from 'calypso/my-sites/patterns/components/localized-link';
import { PatternPreviewPlaceholder } from 'calypso/my-sites/patterns/components/pattern-preview/placeholder';
import { PatternsSection } from 'calypso/my-sites/patterns/components/section';
import type { CategoryGalleryFC } from 'calypso/my-sites/patterns/types';

import './style.scss';

export const CategoryGalleryServer: CategoryGalleryFC = ( {
	categories,
	description,
	title,
	patternType,
} ) => {
	return (
		<PatternsSection title={ title } description={ description }>
			<div
				className={ classNames( 'patterns-category-gallery', {
					'is-regular-patterns': patternType === 'regular',
					'is-page-patterns': patternType === 'pages',
				} ) }
			>
				{ categories?.map( ( category ) => (
					<LocalizedLink
						className="patterns-category-gallery__item"
						href={ `/patterns/${ category.name }` }
						key={ category.name }
					>
						<div className="patterns-category-gallery__item-preview">
							<div
								className={ classNames( 'patterns-category-gallery__item-preview', {
									'patterns-category-gallery__item-preview_page-layouts': patternType === 'pages',
									'patterns-category-gallery__item-preview_mirrored': category.name === 'footer',
								} ) }
							>
								<div className="patterns-category-gallery__item-preview-inner">
									<PatternPreviewPlaceholder
										pattern={
											patternType === 'pages'
												? category.pagePreviewPattern
												: category.regularPreviewPattern
										}
									/>
								</div>
							</div>
						</div>

						<div className="patterns-category-gallery__item-name">{ category.label }</div>
						<div className="patterns-category-gallery__item-count">
							{ patternType === 'pages' ? category.pagePatternCount : category.regularPatternCount }{ ' ' }
							patterns
						</div>
					</LocalizedLink>
				) ) }
			</div>
		</PatternsSection>
	);
};
