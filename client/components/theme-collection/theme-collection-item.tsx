import { PropsWithChildren } from 'react';

export default function ThemeCollectionItem( {
	collectionSlug,
	themeId,
	children,
}: PropsWithChildren< { collectionSlug: string; themeId: string } > ) {
	return (
		<div
			key={ `theme-collection-container-${ collectionSlug }-${ themeId }` }
			className="theme-collection__list-item swiper-slide"
		>
			{ children }
		</div>
	);
}
