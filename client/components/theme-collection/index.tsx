import { Button } from '@wordpress/components';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import { ReactElement, useEffect, useRef, PropsWithChildren, useState } from 'react';
import './style.scss';
import { Swiper as SwiperType } from 'swiper/types';

interface ThemeCollectionProps {
	collectionSlug: string;
	heading: string;
	subheading: ReactElement;
}

export default function ThemeCollection( {
	collectionSlug,
	heading,
	subheading,
	children,
}: PropsWithChildren< ThemeCollectionProps > ): ReactElement {
	const swiperInstance = useRef< SwiperType | null >( null );
	const swiperContainerId = `swiper-container-${ collectionSlug }`;

	const [ isSwiperLoaded, setSwiperLoaded ] = useState( false );
	useEffect( () => {
		if ( ! isSwiperLoaded ) {
			const el = document.querySelector( `#${ swiperContainerId }` ) as HTMLElement;
			if ( el ) {
				/**
				 * We have to import the swiper package dynamically because it doesn't offer a CommonJS version. Because of this, the SSR build will fail.
				 *
				 * From a performance standpoint, it should not cause any issues; we are already loading the ThemeCards dynamically anyway.
				 */
				Promise.all( [
					import( 'swiper' ),
					import( 'swiper/modules' ),
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					import( 'swiper/css' ),
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					import( 'swiper/css/navigation' ),
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					import( 'swiper/css/keyboard' ),
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					import( 'swiper/css/mousewheel' ),
				] ).then( ( values ) => {
					const Swiper = values[ 0 ].default;
					const { Navigation, Keyboard, Mousewheel } = values[ 1 ];

					swiperInstance.current = new Swiper( el, {
						cssMode: true,
						mousewheel: true,
						keyboard: {
							enabled: true,
							onlyInViewport: false,
						},
						navigation: {
							nextEl: '.theme-collection__carousel-nav-button--next',
							prevEl: '.theme-collection__carousel-nav-button--previous',
						},
						threshold: 5,
						slideToClickedSlide: true,
						slidesPerView: 'auto',
						spaceBetween: 20,
						modules: [ Navigation, Keyboard, Mousewheel ],
					} );
					setSwiperLoaded( true );
				} );
			}
		}

		return () => {
			swiperInstance.current?.destroy();
		};
	}, [ swiperContainerId, isSwiperLoaded ] );

	return (
		<div className="theme-collection__container ">
			<h2>{ heading }</h2>
			{ subheading }
			<div className="swiper-container" id={ swiperContainerId }>
				<div className="theme-collection__carousel-controls">
					<Button className="theme-collection__carousel-nav-button theme-collection__carousel-nav-button--previous">
						<Icon icon={ chevronLeft } />
					</Button>
					<Button className="theme-collection__carousel-nav-button theme-collection__carousel-nav-button--next">
						<Icon icon={ chevronRight } />
					</Button>
				</div>
				<div className="theme-collection__list-wrapper swiper-wrapper">{ children }</div>
			</div>
		</div>
	);
}

export function CollectionListItem( {
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
