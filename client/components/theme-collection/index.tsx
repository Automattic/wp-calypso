import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { chevronLeft, chevronRight, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { PropsWithChildren, ReactElement, useEffect, useRef, useState } from 'react';
import { Swiper as SwiperType } from 'swiper/types';
import { preventWidows } from 'calypso/lib/formatting';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import './style.scss';

interface ThemeCollectionProps {
	collectionSlug: string;
	title: string;
	description: string | null;
	onSeeAll: () => void;
	collectionIndex: number;
}

export default function ThemeCollection( {
	collectionSlug,
	title,
	description,
	children,
	onSeeAll,
	collectionIndex = 0,
}: PropsWithChildren< ThemeCollectionProps > ): ReactElement {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const swiperInstance = useRef< SwiperType | null >( null );
	const swiperContainerId = `swiper-container-${ collectionSlug }`;

	const onSeeAllAction = () => {
		recordTracksEvent( 'calypso_themeshowcase_collection_see_all_click', {
			collection: collectionSlug,
			collection_index: collectionIndex + 1,
		} );
		onSeeAll();
	};

	const trackNavigationClick = ( direction: string ) => {
		recordTracksEvent( 'calypso_themeshowcase_collection_navigation_click', {
			direction,
			collection: collectionSlug,
			collection_index: collectionIndex + 1,
		} );
	};

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
						navigation: {
							nextEl: '.theme-collection__carousel-nav-button--next',
							prevEl: '.theme-collection__carousel-nav-button--previous',
						},
						slideToClickedSlide: false,
						rewind: true,
						slidesPerView: 1.2,
						spaceBetween: -16,
						breakpoints: isLoggedIn
							? {
									// break-small in Gutenberg breakpoints
									600: {
										slidesPerView: 1.2,
										spaceBetween: -24,
									},
									// break-large in Gutenberg breakpoints
									960: {
										slidesPerView: 1.2,
										spaceBetween: -32,
									},
									// Breakpoint adjusted for CSS grid repositioning
									1009: {
										slidesPerView: 2.1,
										spaceBetween: -32,
									},
									// Breakpoint adjusted for CSS grid repositioning
									1361: {
										slidesPerView: 3,
										spaceBetween: -32,
									},
							  }
							: {
									// deprecated Calypso breakpoints used in the Theme Showcase
									660: {
										slidesPerView: 1.2,
										spaceBetween: -32,
									},
									// Breakpoint adjusted for CSS grid repositioning
									736: {
										slidesPerView: 2.1,
										spaceBetween: -32,
									},
									// break-xlarge in Gutenberg breakpoints
									1080: {
										slidesPerView: 3,
										spaceBetween: -32,
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
	}, [ isLoggedIn, swiperContainerId, isSwiperLoaded ] );

	return (
		<div className="theme-collection__container swiper-container" id={ swiperContainerId }>
			<div className="theme-collection__meta">
				<div className="theme-collection__headings">
					<h2 className="theme-collection__title">{ title }</h2>
					<div className="theme-collection__description">{ preventWidows( description ) }</div>
				</div>
				<div className="theme-collection__carousel-controls">
					<Button className="theme-collection__see-all" onClick={ onSeeAllAction }>
						{ translate( 'See all' ) }
					</Button>
					<Button
						onClick={ () => trackNavigationClick( 'previous' ) }
						className="theme-collection__carousel-nav-button theme-collection__carousel-nav-button--previous"
					>
						<Icon icon={ chevronLeft } />
					</Button>
					<Button
						onClick={ () => trackNavigationClick( 'next' ) }
						className="theme-collection__carousel-nav-button theme-collection__carousel-nav-button--next"
					>
						<Icon icon={ chevronRight } />
					</Button>
				</div>
			</div>
			<div className="theme-collection__list-wrapper swiper-wrapper">{ children }</div>
		</div>
	);
}
