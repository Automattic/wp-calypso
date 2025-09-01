import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import './gallery-overlay.scss';

const GalleryOverlay = ( {
	isOpen,
	images,
	currentIndex,
	isLoading,
	error,
	onClose,
	onNext,
	onPrevious,
	onGoToFirst,
	onGoToLast,
	onClearError,
} ) => {
	const translate = useTranslate();
	const [ isImageLoading, setIsImageLoading ] = useState( false );
	const [ imageError, setImageError ] = useState( false );
	const [ imageDimensions, setImageDimensions ] = useState( null );
	const [ touchStart, setTouchStart ] = useState( null );
	const [ touchEnd, setTouchEnd ] = useState( null );

	// Calculate navigation states (safe defaults if images is empty)
	const currentImage = images[ currentIndex ] || {};
	const hasMultipleImages = images.length > 1;
	const hasPrevious = currentIndex > 0;
	const hasNext = currentIndex < images.length - 1;

	// Handle keyboard events
	useEffect( () => {
		const handleKeydown = ( event ) => {
			if ( ! isOpen ) {
				return;
			}

			switch ( event.key ) {
				case 'Escape':
					onClose();
					break;
				case 'ArrowLeft':
				case 'h': // Vim-style navigation
					if ( hasPrevious ) {
						onPrevious();
					}
					break;
				case 'ArrowRight':
				case 'l': // Vim-style navigation
					if ( hasNext ) {
						onNext();
					}
					break;
				case ' ':
				case 'Enter':
					onClose();
					break;
				case 'Home':
					if ( hasMultipleImages && currentIndex > 0 && onGoToFirst ) {
						onGoToFirst();
					}
					break;
				case 'End':
					if ( hasMultipleImages && currentIndex < images.length - 1 && onGoToLast ) {
						onGoToLast();
					}
					break;
				default:
					return;
			}
			event.preventDefault();
		};

		if ( isOpen ) {
			document.addEventListener( 'keydown', handleKeydown );
		}

		return () => {
			document.removeEventListener( 'keydown', handleKeydown );
		};
	}, [
		isOpen,
		onClose,
		onNext,
		onPrevious,
		onGoToFirst,
		onGoToLast,
		hasPrevious,
		hasNext,
		hasMultipleImages,
		currentIndex,
		images.length,
	] );

	// Prevent body scroll when overlay is open
	useEffect( () => {
		if ( isOpen ) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.body.style.overflow = '';
		};
	}, [ isOpen ] );

	// Enhanced preloading for smoother navigation and performance
	useEffect( () => {
		if ( ! isOpen || ! hasMultipleImages ) {
			return;
		}

		const preloadImage = ( src, priority = 'normal' ) => {
			return new Promise( ( resolve, reject ) => {
				const img = new Image();

				// Handle successful load
				img.onload = () => {
					resolve( img );
				};

				// Handle load errors
				img.onerror = () => {
					reject( new Error( `Failed to preload image: ${ src }` ) );
				};

				// Set loading priority if supported
				if ( 'loading' in img ) {
					img.loading = priority === 'high' ? 'eager' : 'lazy';
				}

				// Start loading
				img.src = src;
			} );
		};

		const preloadImages = async () => {
			const preloadPromises = [];

			// Preload adjacent images with high priority
			if ( hasNext ) {
				preloadPromises.push(
					preloadImage( images[ currentIndex + 1 ].src, 'high' ).catch( () => {} ) // Silently handle preload failures
				);
			}

			if ( hasPrevious ) {
				preloadPromises.push(
					preloadImage( images[ currentIndex - 1 ].src, 'high' ).catch( () => {} )
				);
			}

			// Preload further images with normal priority
			const furtherIndices = [];
			if ( currentIndex + 2 < images.length ) {
				furtherIndices.push( currentIndex + 2 );
			}
			if ( currentIndex - 2 >= 0 ) {
				furtherIndices.push( currentIndex - 2 );
			}

			furtherIndices.forEach( ( index ) => {
				preloadPromises.push( preloadImage( images[ index ].src, 'normal' ).catch( () => {} ) );
			} );

			// Execute all preloads without blocking
			if ( preloadPromises.length > 0 ) {
				Promise.allSettled( preloadPromises );
			}
		};

		// Debounce preloading to avoid excessive requests during rapid navigation
		const timeoutId = setTimeout( preloadImages, 100 );

		return () => clearTimeout( timeoutId );
	}, [ isOpen, hasMultipleImages, hasNext, hasPrevious, currentIndex, images ] );

	// Reset image states when current image changes
	useEffect( () => {
		if ( isOpen ) {
			setImageError( false );
			setImageDimensions( null );
			setIsImageLoading( true );
		}
	}, [ currentIndex, isOpen ] );

	// Handle orientation changes for better responsive behavior
	useEffect( () => {
		if ( ! isOpen ) {
			return;
		}

		const handleOrientationChange = () => {
			// Small delay to allow viewport to adjust
			setTimeout( () => {
				// Force a re-render to adjust image sizing
				setIsImageLoading( true );
				setTimeout( () => setIsImageLoading( false ), 100 );
			}, 100 );
		};

		window.addEventListener( 'orientationchange', handleOrientationChange );
		window.addEventListener( 'resize', handleOrientationChange );

		return () => {
			window.removeEventListener( 'orientationchange', handleOrientationChange );
			window.removeEventListener( 'resize', handleOrientationChange );
		};
	}, [ isOpen ] );

	// Early return after all hooks to comply with Rules of Hooks
	if ( ! isOpen || ! images.length ) {
		return null;
	}

	const handleImageLoad = ( event ) => {
		setIsImageLoading( false );
		setImageError( false );

		// Track image dimensions for better aspect ratio handling
		const img = event.target;
		setImageDimensions( {
			width: img.naturalWidth,
			height: img.naturalHeight,
			aspectRatio: img.naturalWidth / img.naturalHeight,
		} );
	};

	const handleImageLoadStart = () => {
		setIsImageLoading( true );
		setImageError( false );
		setImageDimensions( null );
	};

	const getFallbackImageSrc = ( image ) => {
		// Try different image size variants
		const originalSrc = image.src;

		// If we're loading a high-res version, try medium or thumbnail
		if ( originalSrc.includes( '?w=' ) || originalSrc.includes( '&w=' ) ) {
			// Try medium size first
			const mediumSrc = originalSrc.replace( /[?&]w=\d+/, '?w=800' );
			if ( mediumSrc !== originalSrc ) {
				return mediumSrc;
			}
		}

		// Try removing size parameters entirely for original
		const baseSrc = originalSrc.split( '?' )[ 0 ];
		if ( baseSrc !== originalSrc ) {
			return baseSrc;
		}

		// No fallback available
		return null;
	};

	const handleImageError = ( event ) => {
		setIsImageLoading( false );
		setImageError( true );
		setImageDimensions( null );

		// Try to load a fallback if available
		const img = event.target;
		const fallbackSrc = getFallbackImageSrc( currentImage );

		if ( fallbackSrc && img.src !== fallbackSrc ) {
			img.src = fallbackSrc;
		}
	};

	const handleBackdropClick = () => {
		// Close overlay when clicking on the backdrop
		onClose();
	};

	const handleBackdropKeyDown = ( event ) => {
		// Handle keyboard events on the backdrop for accessibility
		if ( event.key === 'Enter' || event.key === ' ' ) {
			event.preventDefault();
			onClose();
		}
	};

	// Touch event handlers for swipe navigation
	const handleTouchStart = ( event ) => {
		setTouchEnd( null ); // Clear previous touch end
		setTouchStart( event.targetTouches[ 0 ].clientX );
	};

	const handleTouchMove = ( event ) => {
		setTouchEnd( event.targetTouches[ 0 ].clientX );
	};

	const handleTouchEnd = () => {
		if ( ! touchStart || ! touchEnd ) {
			return;
		}

		const distance = touchStart - touchEnd;
		const isLeftSwipe = distance > 50;
		const isRightSwipe = distance < -50;

		if ( isLeftSwipe && hasNext ) {
			onNext();
		}
		if ( isRightSwipe && hasPrevious ) {
			onPrevious();
		}

		// Reset touch state
		setTouchStart( null );
		setTouchEnd( null );
	};

	return (
		<div
			className="gallery-overlay"
			role="dialog"
			aria-modal="true"
			aria-label={ translate( 'Gallery image viewer' ) }
		>
			<div
				className="gallery-overlay__backdrop"
				onClick={ handleBackdropClick }
				onKeyDown={ handleBackdropKeyDown }
				role="button"
				tabIndex={ 0 }
				aria-label={ translate( 'Close gallery' ) }
			/>

			{ /* Close button */ }
			<button
				className="gallery-overlay__close"
				onClick={ onClose }
				aria-label={ translate( 'Close gallery' ) }
			>
				<Gridicon icon="cross" size={ 24 } />
			</button>

			{ /* Previous button */ }
			{ hasMultipleImages && hasPrevious && (
				<button
					className="gallery-overlay__nav gallery-overlay__nav--previous"
					onClick={ onPrevious }
					aria-label={ translate( 'Previous image' ) }
				>
					<Gridicon icon="chevron-left" size={ 36 } />
				</button>
			) }

			{ /* Next button */ }
			{ hasMultipleImages && hasNext && (
				<button
					className="gallery-overlay__nav gallery-overlay__nav--next"
					onClick={ onNext }
					aria-label={ translate( 'Next image' ) }
				>
					<Gridicon icon="chevron-right" size={ 36 } />
				</button>
			) }

			{ /* Image container */ }
			<div className="gallery-overlay__content">
				{ error ? (
					<div className="gallery-overlay__error">
						<div className="gallery-overlay__error-content">
							<Gridicon icon="notice" size={ 48 } />
							<h3>{ translate( 'Gallery Error' ) }</h3>
							<p>{ error }</p>
							<button onClick={ onClearError } className="gallery-overlay__error-button">
								{ translate( 'Try Again' ) }
							</button>
						</div>
					</div>
				) : (
					<div
						className="gallery-overlay__image-container"
						onTouchStart={ handleTouchStart }
						onTouchMove={ handleTouchMove }
						onTouchEnd={ handleTouchEnd }
					>
						{ ( isImageLoading || isLoading ) && ! imageError && (
							<div className="gallery-overlay__loading">
								<Gridicon icon="sync" size={ 48 } />
							</div>
						) }

						{ imageError ? (
							<div className="gallery-overlay__image-error">
								<div className="gallery-overlay__image-error-content">
									<Gridicon icon="image" size={ 48 } />
									<p>{ translate( 'Unable to load image' ) }</p>
									<button
										className="gallery-overlay__retry-button"
										onClick={ () => {
											setImageError( false );
											setIsImageLoading( true );
											// Force image reload by updating src
											const imgElement = document.querySelector( '.gallery-overlay__image' );
											if ( imgElement ) {
												const originalSrc = imgElement.src;
												imgElement.src = '';
												imgElement.src = originalSrc;
											}
										} }
									>
										{ translate( 'Retry' ) }
									</button>
								</div>
							</div>
						) : (
							<img
								src={ currentImage.src }
								alt={ currentImage.alt }
								width={ currentImage.width }
								height={ currentImage.height }
								className={ clsx( 'gallery-overlay__image', {
									'is-loading': isImageLoading,
									'has-dimensions': imageDimensions,
									'is-wide': imageDimensions?.aspectRatio > 1.5,
									'is-tall': imageDimensions?.aspectRatio < 0.67,
								} ) }
								style={
									imageDimensions
										? {
												'--image-aspect-ratio': imageDimensions.aspectRatio,
												'--image-width': imageDimensions.width,
												'--image-height': imageDimensions.height,
										  }
										: {}
								}
								onLoad={ handleImageLoad }
								onLoadStart={ handleImageLoadStart }
								onError={ handleImageError }
								loading="eager"
								decoding="async"
							/>
						) }
					</div>
				) }

				{ /* Image counter and caption */ }
				{ ! error && (
					<div className="gallery-overlay__info">
						{ hasMultipleImages && (
							<div className="gallery-overlay__counter">
								{ translate( '%(current)d of %(total)d', {
									args: {
										current: currentIndex + 1,
										total: images.length,
									},
								} ) }
							</div>
						) }
						{ currentImage.caption && (
							<div className="gallery-overlay__caption">{ currentImage.caption }</div>
						) }
					</div>
				) }
			</div>
		</div>
	);
};

GalleryOverlay.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	images: PropTypes.arrayOf(
		PropTypes.shape( {
			src: PropTypes.string.isRequired,
			alt: PropTypes.string,
			caption: PropTypes.string,
			width: PropTypes.number,
			height: PropTypes.number,
		} )
	).isRequired,
	currentIndex: PropTypes.number.isRequired,
	isLoading: PropTypes.bool,
	error: PropTypes.string,
	onClose: PropTypes.func.isRequired,
	onNext: PropTypes.func.isRequired,
	onPrevious: PropTypes.func.isRequired,
	onGoToFirst: PropTypes.func,
	onGoToLast: PropTypes.func,
	onClearError: PropTypes.func,
};

export default GalleryOverlay;
