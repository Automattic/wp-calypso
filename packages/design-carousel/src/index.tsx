import { Gridicon } from '@automattic/components';
import { useStarterDesignsQuery } from '@automattic/data-stores';
import { Design } from '@automattic/design-picker';
import { useLocale } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import React, { useEffect, useRef } from 'react';
import Swiper from 'swiper';
import { Item } from './item';
import 'swiper/dist/css/swiper.css';

type Props = { onPick: ( design: Design ) => void };

export default function DesignCarousel( { onPick }: Props ) {
	const { __ } = useI18n();

	const swiperInstance = useRef< Swiper | null >( null );

	const locale = useLocale();

	const { data: allDesigns } = useStarterDesignsQuery( {
		vertical_id: '',
		intent: '',
		_locale: locale,
	} );

	const designList = [ 'tsubaki', 'thriving-artist', 'twentytwentytwo' ];
	const staticDesigns = allDesigns?.static?.designs || [];
	const selectedDesigns = staticDesigns.filter( ( design ) => designList.includes( design.slug ) );
	const allVariations: ( Design & { inlineCss?: string } )[] = [];

	selectedDesigns.forEach( ( design ) => {
		if ( design?.style_variations?.length ) {
			// Add each variation as an option
			design?.style_variations?.forEach( ( variation ) => {
				allVariations.push( {
					...design,
					inlineCss: variation.inline_css || '',
				} );
			} );
		} else {
			allVariations.push( design );
		}
	} );

	useEffect( () => {
		if ( allVariations ) {
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
	}, [ allVariations ] );

	if ( ! allVariations ) {
		return null;
	}

	return (
		<div className="design-carousel">
			<div className="design-carousel__carousel swiper-container">
				<div className="swiper-wrapper">
					{ allVariations.map( ( design ) => (
						<div
							className="design-carousel__slide swiper-slide"
							key={ `${ design.slug + design.inlineCss }-slide-item` }
						>
							<Item design={ design } inlineCss={ design.inlineCss } />
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
						if ( swiperInstance.current ) {
							onPick( staticDesigns[ swiperInstance.current?.activeIndex ] );
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
