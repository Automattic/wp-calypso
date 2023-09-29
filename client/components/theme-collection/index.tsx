import { Button } from '@wordpress/components';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import { ReactElement, useEffect, useRef } from 'react';
import './style.scss';
import Swiper from 'swiper';
import { Navigation, Keyboard, Mousewheel } from 'swiper/modules';
import { ThemeBlock } from 'calypso/components/themes-list';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/keyboard';
import 'swiper/css/mousewheel';

interface ThemeCollectionProps {
	heading: string;
	subheading: ReactElement;
	themes: Array< never >;
	collectionSlug: string;
	getScreenshotUrl: ( themeId: string ) => string;
	siteId: string | null;
	getButtonOptions: () => void;
	getActionLabel: () => string;
	isActive: () => boolean;
	getPrice: () => string;
	isInstalling: () => boolean;
}

export default function ThemeCollection( {
	collectionSlug,
	heading,
	subheading,
	themes,
	getScreenshotUrl,
	siteId,
	getButtonOptions,
	getActionLabel,
	isActive,
	getPrice,
	isInstalling,
}: ThemeCollectionProps ): ReactElement {
	const swiperInstance = useRef< Swiper | null >( null );

	useEffect( () => {
		if ( themes.length > 0 ) {
			const el = document.querySelector( '.swiper-container' ) as HTMLElement;
			if ( el ) {
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
			}
		}

		return () => {
			swiperInstance.current?.destroy();
		};
	}, [ themes ] );

	return (
		<div className="theme-collection__container ">
			<h2>{ heading }</h2>
			{ subheading }
			<div className="swiper-container">
				<div className="theme-collection__carousel-controls">
					<Button className="theme-collection__carousel-nav-button theme-collection__carousel-nav-button--previous">
						<Icon icon={ chevronLeft } />
					</Button>
					<Button className="theme-collection__carousel-nav-button theme-collection__carousel-nav-button--next">
						<Icon icon={ chevronRight } />
					</Button>
				</div>
				<div className="theme-collection__list-wrapper swiper-wrapper">
					{ themes.map( ( theme, index ) => (
						<div
							key={ `theme-collection-container-${ collectionSlug }-${ index }` }
							className="theme--collection__list-item swiper-slide"
						>
							<ThemeBlock
								getScreenshotUrl={ getScreenshotUrl }
								index={ index }
								collectionSlug={ collectionSlug }
								theme={ theme }
								siteId={ siteId }
								isActive={ isActive }
								getButtonOptions={ getButtonOptions }
								getActionLabel={ getActionLabel }
								getPrice={ getPrice }
								isInstalling={ isInstalling }
							/>
						</div>
					) ) }
				</div>
			</div>
		</div>
	);
}
