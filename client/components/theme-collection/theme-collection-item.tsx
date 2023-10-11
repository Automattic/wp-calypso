import { PropsWithChildren } from 'react';

export default function ThemeCollectionItem( { children }: PropsWithChildren ) {
	return <div className="theme-collection__list-item swiper-slide">{ children }</div>;
}
