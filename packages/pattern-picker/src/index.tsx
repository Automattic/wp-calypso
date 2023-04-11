import { Gridicon } from '@automattic/components';
import { useStarterDesignsQuery } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import React, { useEffect, useRef } from 'react';
import Swiper from 'swiper';
import { Item } from './item';
import type { Pattern } from './types';
import type { Design } from '@automattic/design-picker';
import 'swiper/dist/css/swiper.css';

type Props = { onPick: ( design: Design ) => void };

export default function PatternPicker( { onPick }: Props ) {
	const { __ } = useI18n();
	const { data: allDesigns } = useStarterDesignsQuery(
		{
			vertical_id: '',
			intent: '',
			seed: undefined,
			_locale: useLocale(),
			include_pattern_virtual_designs: true,
		},
		{
			enabled: true,
		}
	);
	const designs = allDesigns
		? allDesigns.static.designs.filter(
				( design ) =>
					design.is_virtual &&
					design.categories.some( ( category ) => category.slug === 'link-in-bio' )
		  )
		: [];
	const swiperInstance = useRef< Swiper | null >( null );

	useEffect( () => {
		if ( designs ) {
			swiperInstance.current = new Swiper( '.swiper-container', {
				mousewheel: true,
				keyboard: true,
				threshold: 5,
				slideToClickedSlide: true,
				slidesPerView: 'auto',
				spaceBetween: 20,
				centeredSlides: true,
				navigation: {
					prevEl: '.pattern-picker__carousel-nav-button--back',
					nextEl: '.pattern-picker__carousel-nav-button--next',
				},
			} );
		}
		return () => {
			swiperInstance.current?.destroy();
		};
	}, [ designs ] );

	if ( ! designs ) {
		return null;
	}

	return (
		<div className="pattern-picker">
			<div className="pattern-picker__carousel swiper-container">
				<div className="swiper-wrapper">
					{ designs.map( ( design, key ) => (
						<div className="pattern-picker__slide swiper-slide" key={ key }>
							<Item design={ design } />
						</div>
					) ) }
				</div>
				<div className="pattern-picker__controls">
					<button className="pattern-picker__carousel-nav-button pattern-picker__carousel-nav-button--back">
						<Icon icon={ chevronLeft } />
					</button>
					<button className="pattern-picker__carousel-nav-button pattern-picker__carousel-nav-button--next">
						<Icon icon={ chevronRight } />
					</button>
				</div>
			</div>
			<div className="pattern-picker__cta">
				<Button
					className="pattern-picker__select"
					isPrimary
					onClick={ () => {
						if ( swiperInstance.current ) {
							onPick( designs[ swiperInstance.current?.activeIndex ] );
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

export type { Pattern };
