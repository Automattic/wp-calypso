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

	// Preload adjacent images for smooth navigation
	useEffect( () => {
		if ( ! isOpen || ! hasMultipleImages ) {
			return;
		}

		const preloadImage = ( src ) => {
			const img = new Image();
			img.src = src;
		};

		// Preload next image
		if ( hasNext ) {
			preloadImage( images[ currentIndex + 1 ].src );
		}

		// Preload previous image
		if ( hasPrevious ) {
			preloadImage( images[ currentIndex - 1 ].src );
		}
	}, [ isOpen, hasMultipleImages, hasNext, hasPrevious, currentIndex, images ] );

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

	const handleImageLoad = () => {
		setIsImageLoading( false );
	};

	const handleImageLoadStart = () => {
		setIsImageLoading( true );
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
						{ ( isImageLoading || isLoading ) && (
							<div className="gallery-overlay__loading">
								<Gridicon icon="sync" size={ 48 } />
							</div>
						) }
						<img
							src={ currentImage.src }
							alt={ currentImage.alt }
							className={ clsx( 'gallery-overlay__image', {
								'is-loading': isImageLoading,
							} ) }
							onLoad={ handleImageLoad }
							onLoadStart={ handleImageLoadStart }
						/>
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
