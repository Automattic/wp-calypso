import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import React, { useRef, useState } from 'react';
import { Navigation, Mousewheel, Keyboard } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperClass } from 'swiper/types';
import { PATTERN_SOURCE_SITE_SLUG } from './constants';
import { Item } from './item';
import useQueryPatterns from './use-query-patterns';
import type { Pattern } from './types';
import 'swiper/css';
import 'swiper/css/navigation';

type Props = { onPick: ( pattern: Pattern ) => void };

export function PatternPicker( { onPick }: Props ) {
	const { __ } = useI18n();
	const { data: patterns } = useQueryPatterns( PATTERN_SOURCE_SITE_SLUG );
	const [ swiper, setSwiper ] = useState< SwiperClass | null >( null );
	const prevRef = useRef< HTMLButtonElement >( null );
	const nextRef = useRef< HTMLButtonElement >( null );

	const slideTo = ( index: number ) => {
		if ( swiper ) {
			swiper.slideTo( index );
		}
	};

	if ( ! patterns ) {
		return null;
	}

	return (
		<div className="pattern-picker">
			<Swiper
				autoHeight={ true }
				mousewheel={ true }
				keyboard={ true }
				slidesPerView={ 'auto' }
				spaceBetween={ 20 }
				modules={ [ Navigation, Mousewheel, Keyboard ] }
				onSwiper={ setSwiper }
				className="pattern-picker__carousel"
				navigation={ {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					prevEl: prevRef.current!,
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					nextEl: nextRef.current!,
				} }
				centeredSlides={ true }
			>
				{ patterns.map( ( pattern, i ) => (
					<SwiperSlide key={ `${ pattern.ID }-slide` } className="pattern-picker__slide">
						<Item
							key={ `${ pattern.ID }-slide-item` }
							onClick={ () => slideTo( i ) }
							pattern={ pattern }
						/>
					</SwiperSlide>
				) ) }
				<div className="pattern-picker__controls">
					<button
						ref={ prevRef }
						className="pattern-picker__carousel-nav-button pattern-picker__carousel-nav-button--back"
					>
						<Icon icon={ chevronLeft } />
					</button>
					<button
						ref={ nextRef }
						className="pattern-picker__carousel-nav-button pattern-picker__carousel-nav-button--next"
					>
						<Icon icon={ chevronRight } />
					</button>
				</div>
			</Swiper>
			<div className="pattern-picker__cta">
				<Button
					className="pattern-picker__select"
					isPrimary
					onClick={ () => {
						if ( swiper ) {
							onPick( patterns[ swiper.activeIndex ] );
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
