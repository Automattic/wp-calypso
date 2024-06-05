import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { LocalizedLink } from 'calypso/my-sites/patterns/components/localized-link';
import { PatternPreviewPlaceholder } from 'calypso/my-sites/patterns/components/pattern-preview/placeholder';
import { PatternsSection } from 'calypso/my-sites/patterns/components/section';
import { getCategoryUrlPath } from 'calypso/my-sites/patterns/paths';
import { PatternTypeFilter, type CategoryGalleryFC } from 'calypso/my-sites/patterns/types';

import './style.scss';

export const CategoryGalleryServer: CategoryGalleryFC = ( {
	categories,
	description,
	title,
	patternTypeFilter,
} ) => {
	const translate = useTranslate();

	return (
		<PatternsSection title={ title } description={ description }>
			<div
				className={ clsx( 'patterns-category-gallery', {
					'is-regular-patterns': patternTypeFilter === PatternTypeFilter.REGULAR,
					'is-page-patterns': patternTypeFilter === PatternTypeFilter.PAGES,
				} ) }
			>
				{ categories?.map( ( category ) => {
					const patternCountText =
						patternTypeFilter === PatternTypeFilter.REGULAR
							? translate( '%(count)d pattern', '%(count)d patterns', {
									count: category.regularPatternCount,
									args: { count: category.regularPatternCount },
							  } )
							: translate( '%(count)d layout', '%(count)d layouts', {
									count: category.pagePatternCount,
									args: { count: category.pagePatternCount },
							  } );
					return (
						<LocalizedLink
							className="patterns-category-gallery__item"
							href={ getCategoryUrlPath( category.name, patternTypeFilter, false ) }
							key={ category.name }
						>
							<div className="patterns-category-gallery__item-preview">
								<div
									className={ clsx( 'patterns-category-gallery__item-preview', {
										'patterns-category-gallery__item-preview--page-layout':
											patternTypeFilter === PatternTypeFilter.PAGES,
										'patterns-category-gallery__item-preview--mirrored': category.name === 'footer',
									} ) }
								>
									<div className="patterns-category-gallery__item-preview-inner">
										<PatternPreviewPlaceholder
											title={
												patternTypeFilter === PatternTypeFilter.PAGES
													? category.pagePreviewPattern?.title
													: category.regularPreviewPattern?.title
											}
										/>
									</div>
								</div>
							</div>

							<div className="patterns-category-gallery__item-name">{ category.label }</div>
							<div className="patterns-category-gallery__item-count">{ patternCountText }</div>
						</LocalizedLink>
					);
				} ) }
			</div>
		</PatternsSection>
	);
};
