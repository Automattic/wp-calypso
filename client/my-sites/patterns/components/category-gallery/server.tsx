import { LocalizedLink } from 'calypso/my-sites/patterns/components/localized-link';
import { PatternPreviewPlaceholder } from 'calypso/my-sites/patterns/components/pattern-preview-placeholder';
import { PatternsSection } from 'calypso/my-sites/patterns/components/section';
import type { CategoryGalleryFC } from 'calypso/my-sites/patterns/types';

import './style.scss';

export const CategoryGalleryServer: CategoryGalleryFC = ( {
	categories,
	columnCount = 4,
	description,
	title,
} ) => {
	if ( ! categories ) {
		return null;
	}

	return (
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
						<div className="patterns-category-gallery__item-preview">
							<div className="patterns-category-gallery__item-preview">
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
