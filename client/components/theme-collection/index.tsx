import { Button } from '@wordpress/components';
import { chevronLeft, chevronRight, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { PropsWithChildren, ReactElement, useEffect, useRef, useState } from 'react';
import './style.scss';
import { Swiper as SwiperType } from 'swiper/types';

interface ThemeCollectionProps {
	collectionSlug: string;
	title: string;
	description: ReactElement;
	onSeeAll: () => void;
}

export default function ThemeCollection( {
	collectionSlug,
	title,
	description,
	children,
	onSeeAll,
}: PropsWithChildren< ThemeCollectionProps > ): ReactElement {
	const swiperInstance = useRef< SwiperType | null >( null );
	const swiperContainerId = `swiper-container-${ collectionSlug }`;

	const translate = useTranslate();

	const [ isSwiperLoaded, setSwiperLoaded ] = useState( false );
	useEffect( () => {
		if ( ! isSwiperLoaded || ! swiperInstance?.current || swiperInstance.current?.destroyed ) {
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
						slideToClickedSlide: false,
						rewind: true,
						slidesPerView: 1.2,
						breakpoints: {
							// deprecated Calypso breakpoints used in the Theme Showcase
							'660': {
								slidesPerView: 2.3,
							},
							// break-xlarge in Gutenberg breakpoints
							'1080': {
								slidesPerView: 3,
							},
						},
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
		<div className="theme-collection__container swiper-container" id={ swiperContainerId }>
			<div className="theme-collection__meta">
				<div className="theme-collection__headings">
					<h2 className="theme-collection__title">{ title }</h2>
					<div className="theme-collection__description">{ description }</div>
				</div>
				<div className="theme-collection__carousel-controls">
					<Button className="theme-collection__see-all" onClick={ onSeeAll }>
						{ translate( 'See all' ) }
					</Button>
					<Button className="theme-collection__carousel-nav-button theme-collection__carousel-nav-button--previous">
						<Icon icon={ chevronLeft } />
					</Button>
					<Button className="theme-collection__carousel-nav-button theme-collection__carousel-nav-button--next">
						<Icon icon={ chevronRight } />
					</Button>
				</div>
			</div>
			<div className="theme-collection__list-wrapper swiper-wrapper">{ children }</div>
		</div>
	);
}
