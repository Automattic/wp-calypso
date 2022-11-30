import { Gridicon } from '@automattic/components';
import { useStarterDesignsQuery } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import React, { useEffect, useRef } from 'react';
import Swiper from 'swiper';
import { Item } from './item';
import 'swiper/dist/css/swiper.css';
import type { Design } from '@automattic/design-picker/src/types';

type Props = { onPick: ( design: Design ) => void };

export default function DesignCarousel( { onPick }: Props ) {
	const { __ } = useI18n();

	const swiperInstance = useRef< Swiper | null >( null );

	const locale = useLocale();

	const { data: allDesigns } = useStarterDesignsQuery( {
		vertical_id: '',
		intent: 'sell',
		_locale: locale,
	} );

	// Cherry-picked designs
	const designSlugs = [ 'tsubaki', 'tazza', 'thriving-artist', 'zaino', 'twentytwentytwo' ];

	const selectedDesigns = designSlugs
		.map( ( designSlug ) =>
			allDesigns?.static.designs.find( ( design ) => design.slug === designSlug )
		)
		// Remove not found (not launched) items
		.filter( ( design ) => !! design ) as Design[];

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
					{ selectedDesigns.map( ( design ) => (
						<div
							className="design-carousel__slide swiper-slide"
							key={ `${ design.slug }-slide-item` }
						>
							<Item design={ design } type="desktop" className="design-carousel__item-desktop" />
							<Item design={ design } type="mobile" className="design-carousel__item-mobile" />
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
