import { PatternsSection } from 'calypso/my-sites/patterns/components/section';
import type { CSSProperties } from 'react';

import './style.scss';

type PatternsGridGalleryProps = {
	title: string;
	description: string;
	columnCount?: number;
	list?: {
		name?: string;
		label?: string;
		number: number;
		image: string;
		link: string;
	}[];
};

export const PatternsGridGallery = ( {
	title,
	description,
	columnCount = 4,
	list,
}: PatternsGridGalleryProps ) => {
	if ( ! list ) {
		return null;
	}

	return (
		<PatternsSection title={ title } description={ description }>
			<div
				className="patterns-grid-gallery"
				style={ { '--column-count': columnCount } as CSSProperties }
			>
				{ list.map( ( { name, label, number, image, link } ) => (
					<a className="patterns-grid-gallery__item" href={ link } key={ name }>
						<div className="patterns-grid-gallery__item-image">
							<img src={ image } alt={ label } />
						</div>
						<div className="patterns-grid-gallery__item-name">{ name }</div>
						<div className="patterns-grid-gallery__item-number">{ number } patterns</div>
					</a>
				) ) }
			</div>
		</PatternsSection>
	);
};
