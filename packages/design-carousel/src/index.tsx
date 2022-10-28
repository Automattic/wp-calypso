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

type Props = { onPick: ( design: any ) => void };

export default function DesignCarousel( { onPick }: Props ) {
	const { __ } = useI18n();

	const swiperInstance = useRef< Swiper | null >( null );

	const locale = useLocale();

	const { data: allDesigns } = useStarterDesignsQuery( {
		vertical_id: '',
		intent: 'sell',
		_locale: locale,
	} );

	const staticDesigns = allDesigns?.static?.designs.slice( 0, 10 ) || [];

	useEffect( () => {
		if ( staticDesigns ) {
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
	}, [ staticDesigns ] );

	if ( ! staticDesigns ) {
		return null;
	}

	return (
		<div className="design-carousel">
			<div className="design-carousel__carousel swiper-container">
				<div className="swiper-wrapper">
					{ staticDesigns.map( ( design ) => (
						<div
							className="design-carousel__slide swiper-slide"
							key={ `${ design.slug }-slide-item` }
						>
							<Item design={ design } />
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
