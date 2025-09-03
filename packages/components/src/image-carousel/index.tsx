import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useState, useEffect } from '@wordpress/element';
import { Icon, close } from '@wordpress/icons';
import { createRoot } from 'react-dom/client';
import { Navigation, Keyboard } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

/**
 * Styles
 */
import 'swiper/css';
import 'swiper/css/navigation';
import './style.scss';

interface CarouselImage {
	src: string;
	alt?: string;
	originalFile?: string;
	caption?: string;
}

/**
 * Combined modal and carousel component
 */
const ImageCarouselModal = ( {
	images,
	initialIndex = 0,
	onClose,
}: {
	images: CarouselImage[];
	initialIndex?: number;
	onClose: () => void;
} ) => {
	const [ currentIndex, setCurrentIndex ] = useState( initialIndex );
	const isMobile = useMobileBreakpoint();

	const getImageSrc = ( image: CarouselImage ) => {
		if ( image.originalFile ) {
			return isMobile ? image.originalFile + '?w=1000' : image.originalFile + '?w=2000';
		}

		return image.src;
	};

	// Handle escape key close
	useEffect( () => {
		const handleKeyDown = ( event: KeyboardEvent ) => {
			if ( event.key === 'Escape' ) {
				event.preventDefault();
				event.stopPropagation();
				onClose();
			}
		};

		// Listen on window with highest priority
		window.addEventListener( 'keydown', handleKeyDown, { capture: true } );

		return () => {
			window.removeEventListener( 'keydown', handleKeyDown, { capture: true } );
		};
	}, [ onClose ] );

	return (
		<div className="reader-image-carousel-overlay">
			<div className="reader-image-carousel-container">
				<Swiper
					className="reader-image-carousel-wrap"
					modules={ [ Navigation, Keyboard ] }
					keyboard={ { enabled: true } }
					slidesPerView={ 1 }
					initialSlide={ initialIndex }
					loop
					navigation={ isMobile ? false : true }
					freeMode={ false }
					onSlideChange={ ( swiper ) => setCurrentIndex( swiper.realIndex ) }
				>
					{ images.map( ( image, index ) => (
						<SwiperSlide key={ index } virtualIndex={ index }>
							<img
								// Adding width to get an appropriate size image
								src={ getImageSrc( image ) }
								alt={ image.alt || '' }
							/>
						</SwiperSlide>
					) ) }
				</Swiper>

				<div className="reader-image-carousel-footer">
					<div className="reader-image-carousel-pagination">
						<span>
							{ currentIndex + 1 } / { images.length }
						</span>
					</div>
					<div className="reader-image-carousel-caption">
						{ images[ currentIndex ].caption?.replace( /<[^>]*>/g, '' ) }
					</div>
				</div>
			</div>

			<button className="reader-image-carousel-close" onClick={ onClose } aria-label="Close">
				<Icon icon={ close } size={ 17 } style={ { fill: '#fff' } } />
			</button>
		</div>
	);
};

// Global state
let modalRoot: ReturnType< typeof createRoot > | null = null;
let modalContainer: HTMLElement | null = null;

/**
 * "Add" function that manages both pieces
 */
export const addImageCarousel = ( imageBlocks: Element[] ) => {
	const images = Array.from( imageBlocks ).map( ( item ) => {
		const img = item.querySelector( 'img' ) as HTMLImageElement;
		return {
			src: img.src,
			originalFile: img.dataset.origFile,
			caption: img.dataset.imageCaption || '',
			alt: img.alt || '',
		};
	} );

	// Create persistent modal overlay if it doesn't exist
	if ( ! modalRoot ) {
		modalContainer = document.createElement( 'div' );
		modalContainer.id = 'reader-image-carousel-modal';
		document.body.appendChild( modalContainer );
		modalRoot = createRoot( modalContainer );
	}

	const openModal = ( initialIndex: number ) => {
		const handleClose = () => {
			modalContainer
				?.querySelector( '.reader-image-carousel-overlay' )
				?.classList.add( 'is-closing' );

			// Wait for transition to complete before removing
			setTimeout( () => {
				modalRoot?.render( null );
			}, 200 );
		};

		// Render modal with carousel content
		modalRoot?.render(
			<ImageCarouselModal images={ images } initialIndex={ initialIndex } onClose={ handleClose } />
		);
	};

	// Add click handlers to images
	Array.from( imageBlocks ).forEach( ( item, index ) => {
		const img = item.querySelector( 'img' );
		if ( img ) {
			img.style.cursor = 'pointer';
			img.setAttribute( 'role', 'button' );
			img.setAttribute( 'tabindex', '0' );
			img.setAttribute( 'aria-label', 'View image in carousel' );
			img.addEventListener( 'keydown', ( event ) => {
				if ( event.key === 'Enter' ) {
					openModal( index );
				}
			} );
			img.addEventListener( 'click', () => {
				openModal( index );
			} );
		}
	} );
};

// Export for backwards compatibility
export const ImageCarousel = ImageCarouselModal;
