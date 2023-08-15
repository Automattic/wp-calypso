import { Gridicon } from '@automattic/components';
import { MShotsOptions } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef } from 'react';
import Swiper from 'swiper';
import { Navigation, Keyboard, Mousewheel } from 'swiper/modules';
import { Item } from './item';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/keyboard';
import 'swiper/css/mousewheel';
import type { Design } from '@automattic/design-picker/src/types';

type DesignCarouselProps = {
	onPick: ( design: Design ) => void;
	selectedDesigns: Design[] | null | undefined;
	onlyDisplayMobileCarousel?: boolean;
	carouselDesktopOptions?: MShotsOptions;
	carouselMobileOptions?: MShotsOptions;
};

export default function DesignCarousel( {
	onPick,
	selectedDesigns,
	onlyDisplayMobileCarousel = false,
	carouselDesktopOptions = { w: 1280, vpw: 1920, vph: 1280, format: 'png' },
	carouselMobileOptions = { w: 400, vpw: 400, vph: 872, format: 'png' },
}: DesignCarouselProps ) {
	const { __ } = useI18n();
	const swiperInstance = useRef< Swiper | null >( null );

	useEffect( () => {
		if ( selectedDesigns ) {
			swiperInstance.current = new Swiper( '.swiper-container', {
				cssMode: true,
				autoHeight: true,
				mousewheel: true,
				keyboard: {
					enabled: true,
					onlyInViewport: false,
				},
				threshold: 5,
				slideToClickedSlide: true,
				slidesPerView: 'auto',
				spaceBetween: 20,
				centeredSlides: true,
				navigation: {
					prevEl: '.design-carousel__carousel-nav-button--back',
					nextEl: '.design-carousel__carousel-nav-button--next',
				},
				modules: [ Navigation, Keyboard, Mousewheel ],
			} );
		}
		return () => {
			swiperInstance.current?.destroy();
		};
	}, [ selectedDesigns ] );

	if ( ! selectedDesigns ) {
		return null;
	}

	return (
		<div className="design-carousel">
			<div className="design-carousel__carousel swiper-container">
				<div className="swiper-wrapper">
					{ selectedDesigns.map( ( design, key ) => (
						<div className="design-carousel__slide swiper-slide" key={ key }>
							{ ! onlyDisplayMobileCarousel ? (
								<>
									<Item
										design={ design }
										options={ carouselDesktopOptions }
										className="design-carousel__item-desktop"
									/>
									<Item
										design={ design }
										options={ carouselMobileOptions }
										className="design-carousel__item-mobile"
									/>
								</>
							) : (
								<Item
									design={ design }
									options={ carouselMobileOptions }
									className="design-carousel__item-mobile-only"
								/>
							) }
						</div>
					) ) }
				</div>
				<div className="design-carousel__controls">
					<button className="design-carousel__carousel-nav-button design-carousel__carousel-nav-button--back">
						<Icon icon={ chevronLeft } />
					</button>
					<button className="design-carousel__carousel-nav-button design-carousel__carousel-nav-button--next">
						<Icon icon={ chevronRight } />
					</button>
				</div>
			</div>
			<div className="design-carousel__cta">
				<Button
					className="design-carousel__select"
					variant="primary"
					onClick={ () => {
						if ( swiperInstance.current && selectedDesigns ) {
							onPick( selectedDesigns[ swiperInstance.current?.activeIndex ] );
						}
					} }
				>
					<span>{ __( 'Continue' ) }</span>
					<Gridicon icon="heart" size={ 18 } />
				</Button>
			</div>
		</div>
	);
}
