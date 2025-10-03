import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useState, useEffect } from '@wordpress/element';
import { Icon, close, chevronLeft, chevronRight } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { createRoot } from 'react-dom/client';
import Swipeable from '../swipeable';

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
	const translate = useTranslate();
	const [ currentIndex, setCurrentIndex ] = useState( initialIndex );
	const isMobile = useMobileBreakpoint();

	const getImageSrc = ( image: CarouselImage ) => {
		if ( image.originalFile ) {
			return isMobile ? image.originalFile + '?w=1000' : image.originalFile + '?w=2000';
		}

		return image.src;
	};

	// Handle escape and arrow key navigation
	useEffect( () => {
		const handleKeyDown = ( event: KeyboardEvent ) => {
			if ( event.key === 'Escape' ) {
				event.preventDefault();
				event.stopPropagation();
				onClose();
			} else if ( event.key === 'ArrowLeft' ) {
				event.preventDefault();
				setCurrentIndex( ( prev ) => ( prev > 0 ? prev - 1 : images.length - 1 ) );
			} else if ( event.key === 'ArrowRight' ) {
				event.preventDefault();
				setCurrentIndex( ( prev ) => ( prev < images.length - 1 ? prev + 1 : 0 ) );
			}
		};

		// Listen on window with highest priority
		window.addEventListener( 'keydown', handleKeyDown, { capture: true } );

		return () => {
			window.removeEventListener( 'keydown', handleKeyDown, { capture: true } );
		};
	}, [ onClose, images.length ] );

	const goToPrevious = () => {
		setCurrentIndex( ( prev ) => ( prev > 0 ? prev - 1 : images.length - 1 ) );
	};

	const goToNext = () => {
		setCurrentIndex( ( prev ) => ( prev < images.length - 1 ? prev + 1 : 0 ) );
	};

	const handlePageSelect = ( newIndex: number ) => {
		setCurrentIndex( newIndex );
	};

	if ( images.length === 0 ) {
		return null;
	}

	return (
		<div className="reader-image-carousel-overlay">
			<Swipeable
				className="reader-image-carousel-wrap"
				currentPage={ currentIndex }
				onPageSelect={ handlePageSelect }
				pageClassName="reader-image-carousel-slide"
				containerClassName="reader-image-carousel-container"
				isClickEnabled={ false }
			>
				{ images.map( ( image, index ) => (
					<img key={ index } src={ getImageSrc( image ) } alt={ image.alt || '' } />
				) ) }
			</Swipeable>

			<button
				className="reader-image-carousel-button reader-image-carousel-button--close"
				onClick={ onClose }
				aria-label={ translate( 'Close modal' ) }
			>
				<Icon icon={ close } size={ 17 } />
			</button>

			{ ! isMobile && (
				<>
					<button
						className="reader-image-carousel-button reader-image-carousel-button--prev"
						onClick={ goToPrevious }
						aria-label={ translate( 'Previous image' ) }
					>
						<Icon icon={ chevronLeft } size={ 24 } />
					</button>
					<button
						className="reader-image-carousel-button reader-image-carousel-button--next"
						onClick={ goToNext }
						aria-label={ translate( 'Next image' ) }
					>
						<Icon icon={ chevronRight } size={ 24 } />
					</button>
				</>
			) }

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
