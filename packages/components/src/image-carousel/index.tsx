import { useState } from '@wordpress/element';
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
					navigation
					centeredSlides
					onSlideChange={ ( swiper ) => setCurrentIndex( swiper.realIndex ) }
				>
					{ images.map( ( image, index ) => (
						<SwiperSlide key={ index } virtualIndex={ index }>
							<img
								// Adding width to get an appropriate size image
								src={ image.originalFile ? image.originalFile + '?w=2000' : image.src }
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

			<button className="reader-image-carousel-close" onClick={ onClose }>
				<Icon icon={ close } size={ 17 } style={ { fill: '#fff' } } />
			</button>
		</div>
	);
};

// Global state
let modalRoot: ReturnType< typeof createRoot > | null = null;

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
		const modalContainer = document.createElement( 'div' );
		modalContainer.id = 'reader-image-carousel-modal';
		document.body.appendChild( modalContainer );
		modalRoot = createRoot( modalContainer );
	}

	const openModal = ( initialIndex: number ) => {
		const handleClose = () => {
			modalRoot?.render( null );
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
			img.addEventListener( 'click', () => {
				openModal( index );
			} );
		}
	} );
};

// Export for backwards compatibility
export const ImageCarousel = ImageCarouselModal;
