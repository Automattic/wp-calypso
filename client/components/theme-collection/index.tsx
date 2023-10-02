import { Button } from '@wordpress/components';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import { ReactElement, useEffect, useRef } from 'react';
import './style.scss';
import { Swiper as SwiperType } from 'swiper/types';
import { ThemeBlock } from 'calypso/components/themes-list';

interface ThemeCollectionProps {
	heading: string;
	subheading: ReactElement;
	themes: Array< { id: string } >;
	collectionSlug: string;
	getScreenshotUrl: ( themeId: string ) => string;
	siteId: string | null;
	getButtonOptions: () => void;
	getActionLabel: () => string;
	isActive: () => boolean;
	getPrice: () => string;
	isInstalling: () => boolean;
	showMoreLink: string;
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
	showMoreLink,
}: ThemeCollectionProps ): ReactElement {
	const swiperInstance = useRef< SwiperType | null >( null );
	useEffect( () => {
		if ( themes !== null && themes.length > 0 ) {
			const el = document.querySelector( '.swiper-container' ) as HTMLElement;
			if ( el ) {
				/**
				 * We have to import the swiper package dynamically because it doesn't offer a CommonJS version. Because of this, the SSR build will fail.
				 *
				 * From a performance standpoint, I don't think it will cause any issues; we are already loading the ThemeCards dynamically anyway.
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
				} );
			}
		}

		return () => {
			swiperInstance.current?.destroy();
		};
	}, [ themes ] );

	if ( themes === null ) {
		return <></>; // @todo Add LoadingPlaceholders instead.
	}

	return (
		<div className="theme-collection__container ">
			<h2>{ heading }</h2>
			{ subheading }
			<div className="swiper-container">
				<div className="theme-collection__carousel-controls">
					<a href={ showMoreLink }>{ translate( 'See all' ) }</a>
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
							key={ `theme-collection-container-${ collectionSlug }-${ theme.id }` }
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
