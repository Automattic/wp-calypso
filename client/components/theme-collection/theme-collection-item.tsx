import { PropsWithChildren } from 'react';

type ThemeCollectionProps = {
	slug: string;
	collectionSlug: string;
};

export default function ThemeCollectionItem( {
	slug,
	collectionSlug,
	children,
}: PropsWithChildren< ThemeCollectionProps > ) {
	return (
		<div
			data-history={ `${ collectionSlug }-${ slug }` }
			className="theme-collection__list-item swiper-slide"
		>
			{ children }
		</div>
	);
}
