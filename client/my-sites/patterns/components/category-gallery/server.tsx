import classNames from 'classnames';
import { LocalizedLink } from 'calypso/my-sites/patterns/components/localized-link';
import { PatternPreviewPlaceholder } from 'calypso/my-sites/patterns/components/pattern-preview/placeholder';
import { PatternsSection } from 'calypso/my-sites/patterns/components/section';
import { getCategorySlug } from 'calypso/my-sites/patterns/controller';
import { PatternTypeFilter, type CategoryGalleryFC } from 'calypso/my-sites/patterns/types';

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
					'is-regular-patterns': patternType === PatternTypeFilter.REGULAR,
					'is-page-patterns': patternType === PatternTypeFilter.PAGES,
				} ) }
			>
				{ categories?.map( ( category ) => (
					<LocalizedLink
						className="patterns-category-gallery__item"
						href={ getCategorySlug( category.name, patternType, false ) }
						key={ category.name }
					>
						<div className="patterns-category-gallery__item-preview">
							<div
								className={ classNames( 'patterns-category-gallery__item-preview', {
									'patterns-category-gallery__item-preview_page-layouts':
										patternType === PatternTypeFilter.PAGES,
									'patterns-category-gallery__item-preview_mirrored': category.name === 'footer',
								} ) }
							>
								<div className="patterns-category-gallery__item-preview-inner">
									<PatternPreviewPlaceholder
										pattern={
											patternType === PatternTypeFilter.PAGES
												? category.pagePreviewPattern
												: category.regularPreviewPattern
										}
									/>
								</div>
							</div>
						</div>

						<div className="patterns-category-gallery__item-name">{ category.label }</div>
						<div className="patterns-category-gallery__item-count">
							{ patternType === PatternTypeFilter.PAGES
								? category.pagePatternCount
								: category.regularPatternCount }{ ' ' }
							patterns
						</div>
					</LocalizedLink>
				) ) }
			</div>
		</PatternsSection>
	);
};
