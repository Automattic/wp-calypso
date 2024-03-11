import classNames from 'classnames';
import { LocalizedLink } from 'calypso/my-sites/patterns/components/localized-link';
import { PatternPreviewPlaceholder } from 'calypso/my-sites/patterns/components/pattern-preview/placeholder';
import { PatternsSection } from 'calypso/my-sites/patterns/components/section';
import type { CategoryGalleryProps, CategoryGalleryFC } from 'calypso/my-sites/patterns/types';

import './style.scss';

export const COLUMN_COUNTS: Record< CategoryGalleryProps[ 'patternType' ], number > = {
	regular: 4,
	pages: 3,
};

export const CategoryGalleryServer: CategoryGalleryFC = ( {
	categories,
	description,
	title,
	patternType,
} ) => {
	return (
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
						<div className="patterns-category-gallery__item-preview">
							<div
								className={ classNames( 'patterns-category-gallery__item-preview', {
									'patterns-category-gallery__item-preview_page-layouts': patternType === 'pages',
									'patterns-category-gallery__item-preview_mirrored': category.name === 'footer',
								} ) }
							>
								<div className="patterns-category-gallery__item-preview-inner">
									<PatternPreviewPlaceholder pattern={ category.previewPattern } />
								</div>
							</div>
						</div>

						<div className="patterns-category-gallery__item-name">{ category.label }</div>
						<div className="patterns-category-gallery__item-count">{ category.count } patterns</div>
					</LocalizedLink>
				) ) }
			</div>
		</PatternsSection>
	);
};
