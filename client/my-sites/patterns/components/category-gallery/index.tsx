import { LocalizedLink } from 'calypso/my-sites/patterns/components/localized-link';
import { PatternsSection } from 'calypso/my-sites/patterns/components/section';
import type { Category } from 'calypso/my-sites/patterns/types';

import './style.scss';

type CategoryWithCount = Category & {
	count: number;
};

type Props = {
	categories?: CategoryWithCount[];
	columnCount?: number;
	description: string;
	title: string;
};

export const CategoryGallery = ( { categories, columnCount = 4, description, title }: Props ) => {
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
						<div className="patterns-category-gallery__item-image">
							{ /* <img src={ image } alt={ label } /> */ }
						</div>
						<div className="patterns-category-gallery__item-name">{ category.label }</div>
						<div className="patterns-category-gallery__item-number">
							{ category.count } patterns
						</div>
					</LocalizedLink>
				) ) }
			</div>
		</PatternsSection>
	);
};
