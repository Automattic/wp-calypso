import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import React, { useEffect, useRef } from 'react';
import Swiper from 'swiper';
import { PATTERN_SOURCE_SITE_SLUG } from './constants';
import { Item } from './item';
import useQueryPatterns from './use-query-patterns';
import type { Pattern } from './types';
import 'swiper/dist/css/swiper.css';

type Props = { onPick: ( pattern: Pattern ) => void };

export default function PatternPicker( { onPick }: Props ) {
	const { __ } = useI18n();
	const { data: patterns } = useQueryPatterns( PATTERN_SOURCE_SITE_SLUG );
	const swiperInstance = useRef< Swiper | null >( null );

	useEffect( () => {
		if ( patterns ) {
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
	}, [ patterns ] );

	if ( ! patterns ) {
		return null;
	}

	return (
		<div className="pattern-picker">
			<div className="pattern-picker__carousel swiper-container">
				<div className="swiper-wrapper">
					{ patterns.map( ( pattern, index ) => (
						<div
							className="pattern-picker__slide swiper-slide"
							key={ `${ pattern.ID }-slide-item` }
						>
							<Item pattern={ pattern } />

							<div className="pattern-picker__cta">
								<Button
									className="pattern-picker__select"
									isPrimary
									onClick={ () => onPick( patterns[ index ] ) }
								>
									<span>{ __( 'Continue' ) }</span>
									<Gridicon icon="heart" size={ 18 } />
								</Button>
							</div>
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
		</div>
	);
}

export type { Pattern };
