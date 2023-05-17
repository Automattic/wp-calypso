import { Gridicon } from '@automattic/components';
import { StarterDesigns, useStarterDesignsQuery } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { MShotsOptions } from '@automattic/onboarding/src';
import { Button } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef } from 'react';
import Swiper from 'swiper';
import { Item } from './item';
import 'swiper/dist/css/swiper.css';
import type { Design } from '@automattic/design-picker/src/types';

type DesignCarouselProps = {
	onPick: ( design: Design ) => void;
	selectedDesignSlugs?: string[];
	flow?: string;
};

export default function DesignCarousel( {
	onPick,
	selectedDesignSlugs,
	flow,
}: DesignCarouselProps ) {
	const { __ } = useI18n();
	const swiperInstance = useRef< Swiper | null >( null );
	const locale = useLocale();
	const isLargerThan1440px = useMediaQuery( '(min-width: 1440px)' );
	const mobileOptions: MShotsOptions = { w: 400, vpw: 400, vph: 872, format: 'png' };
	const desktopOptions: MShotsOptions = {
		w: isLargerThan1440px ? 1920 : 1280,
		vpw: 1920,
		vph: 1280,
		format: 'png',
	};

	const { data: allDesigns } = useStarterDesignsQuery( {
		_locale: locale,
	} );

	const shouldDisplayMobileViewOnly = ( flow: string | undefined ) => {
		switch ( flow ) {
			case 'link-in-bio':
				return true;
			default:
				return false;
		}
	};

	const getLinkInBioDesigns = ( allDesigns: StarterDesigns | undefined ) => {
		const designs = allDesigns
			? allDesigns?.designs.filter(
					( design ) =>
						design.is_virtual &&
						design.categories.some( ( category ) => category.slug === 'link-in-bio' )
			  )
			: [];

		return designs;
	};

	const getEcommerceDesigns = (
		allDesigns: StarterDesigns | undefined,
		selectedDesignSlugs: string[] | undefined
	) => {
		let selectedDesigns = allDesigns?.designs;

		if ( selectedDesigns && selectedDesignSlugs ) {
			// If we have a restricted set of designs, filter out all unwanted designs
			const filteredDesigns = selectedDesigns.filter( ( design ) =>
				selectedDesignSlugs.includes( design.slug )
			);

			// Now order the filtered set based on the supplied slugs.
			selectedDesigns = selectedDesignSlugs
				.map( ( selectedDesignSlug ) =>
					filteredDesigns.find( ( design ) => design.slug === selectedDesignSlug )
				)
				.filter( ( selectedDesign ) => !! selectedDesign ) as Design[];
		}

		return selectedDesigns;
	};

	const getCarouselOptions = ( flow: string | undefined ) => {
		switch ( flow ) {
			case 'link-in-bio':
				return mobileOptions;
			default:
				return desktopOptions;
		}
	};

	const getFlowDesigns = (
		allDesigns: StarterDesigns | undefined,
		locale: string | undefined,
		selectedDesignSlugs: string[] | undefined,
		flow: string | undefined
	) => {
		if ( ! allDesigns || ! locale ) {
			return null;
		}

		switch ( flow ) {
			case 'link-in-bio':
				return getLinkInBioDesigns( allDesigns );
			case 'ecommerce':
				return getEcommerceDesigns( allDesigns, selectedDesignSlugs );
			default:
				return allDesigns?.designs;
		}
	};

	const selectedDesigns = getFlowDesigns( allDesigns, locale, selectedDesignSlugs, flow );

	const onlyDisplayMobileCarousel = shouldDisplayMobileViewOnly( flow );
	const carouselOptions = getCarouselOptions( flow );

	useEffect( () => {
		if ( selectedDesigns ) {
			swiperInstance.current = new Swiper( '.swiper-container', {
				autoHeight: true,
				mousewheel: true,
				keyboard: true,
				threshold: 5,
				slideToClickedSlide: true,
				slidesPerView: 'auto',
				spaceBetween: 20,
				centeredSlides: true,
				navigation: {
					prevEl: '.design-carousel__carousel-nav-button--back',
					nextEl: '.design-carousel__carousel-nav-button--next',
				},
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
										type="desktop"
										options={ carouselOptions }
										className="design-carousel__item-desktop"
									/>
									<Item
										design={ design }
										type="mobile"
										options={ mobileOptions }
										className="design-carousel__item-mobile"
									/>
								</>
							) : (
								<Item
									design={ design }
									type="mobile"
									options={ mobileOptions }
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
					isPrimary
					onClick={ () => {
						if ( swiperInstance.current && selectedDesigns ) {
							onPick( selectedDesigns[ swiperInstance.current?.activeIndex ] );
						}
					} }
				>
					<span>{ __( 'Continue' ) }</span>
					<Gridicon icon="heart" size={ 18 } />
					{ /* Heart icon when hovering over continue missing here */ }
				</Button>
			</div>
		</div>
	);
}
