import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

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

			// Don't handle key events if user is interacting with focusable elements
			const activeElement = document.activeElement;
			const isInteractingWithButton = activeElement && activeElement.tagName === 'BUTTON';

			switch ( event.key ) {
				case 'Escape':
					event.preventDefault();
					onClose();
					break;
				case 'ArrowLeft':
				case 'h': // Vim-style navigation
					if ( hasPrevious && ! isInteractingWithButton ) {
						event.preventDefault();
						onPrevious();
					}
					break;
				case 'ArrowRight':
				case 'l': // Vim-style navigation
					if ( hasNext && ! isInteractingWithButton ) {
						event.preventDefault();
						onNext();
					}
					break;
				case ' ':
					// Space should only close if not focused on a button
					if ( ! isInteractingWithButton ) {
						event.preventDefault();
						onClose();
					}
					break;
				case 'Enter':
					// Enter should close from anywhere except buttons (which have their own handlers)
					if ( ! isInteractingWithButton ) {
						event.preventDefault();
						onClose();
					}
					// If focused on a button, let the button handle it naturally
					return;
				case 'Home':
					if ( hasMultipleImages && currentIndex > 0 && onGoToFirst && ! isInteractingWithButton ) {
						event.preventDefault();
						onGoToFirst();
					}
					break;
				case 'End':
					if (
						hasMultipleImages &&
						currentIndex < images.length - 1 &&
						onGoToLast &&
						! isInteractingWithButton
					) {
						event.preventDefault();
						onGoToLast();
					}
					break;
				case 'ArrowUp':
				case 'ArrowDown':
					// Prevent default scrolling behavior
					event.preventDefault();
					break;
				default:
					return;
			}
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

	// Basic preloading for smoother navigation
	useEffect( () => {
		if ( ! isOpen || ! hasMultipleImages ) {
			return;
		}

		// Preload next image
		if ( hasNext ) {
			const img = new Image();
			img.src = images[ currentIndex + 1 ].src;
		}

		// Preload previous image
		if ( hasPrevious ) {
			const img = new Image();
			img.src = images[ currentIndex - 1 ].src;
		}
	}, [ isOpen, hasMultipleImages, hasNext, hasPrevious, currentIndex, images ] );

	// Reset image states when current image changes
	useEffect( () => {
		if ( isOpen ) {
			setImageError( false );
			setIsImageLoading( true );
		}
	}, [ currentIndex, isOpen ] );

	// Focus trap implementation
	useEffect( () => {
		if ( ! isOpen ) {
			return;
		}

		// Store the previously focused element
		const previouslyFocusedElement = document.activeElement;

		// Focus the close button when modal opens
		const closeButton = document.querySelector( '.gallery-overlay__close' );
		if ( closeButton ) {
			closeButton.focus();
		}

		// Get all focusable elements within the modal
		const getFocusableElements = () => {
			const modal = document.querySelector( '.gallery-overlay' );
			if ( ! modal ) {
				return [];
			}

			const focusableSelectors = [
				'button',
				'[href]',
				'input',
				'select',
				'textarea',
				'[tabindex]:not([tabindex="-1"])',
			];

			return Array.from( modal.querySelectorAll( focusableSelectors.join( ',' ) ) ).filter(
				( element ) => {
					return (
						! element.disabled &&
						element.offsetWidth > 0 &&
						element.offsetHeight > 0 &&
						getComputedStyle( element ).visibility !== 'hidden'
					);
				}
			);
		};

		const handleTabKey = ( event ) => {
			if ( event.key !== 'Tab' ) {
				return;
			}

			const focusableElements = getFocusableElements();
			if ( focusableElements.length === 0 ) {
				return;
			}

			const firstElement = focusableElements[ 0 ];
			const lastElement = focusableElements[ focusableElements.length - 1 ];

			if ( event.shiftKey ) {
				// Shift + Tab: if focused on first element, go to last
				if ( document.activeElement === firstElement ) {
					event.preventDefault();
					lastElement.focus();
				}
			} else if ( document.activeElement === lastElement ) {
				// Tab: if focused on last element, go to first
				event.preventDefault();
				firstElement.focus();
			}
		};

		document.addEventListener( 'keydown', handleTabKey );

		// Return focus to previously focused element when modal closes
		return () => {
			document.removeEventListener( 'keydown', handleTabKey );
			if ( previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function' ) {
				previouslyFocusedElement.focus();
			}
		};
	}, [ isOpen ] );

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
		setImageError( false );
	};

	const handleImageLoadStart = () => {
		setIsImageLoading( true );
		setImageError( false );
	};

	const handleImageError = () => {
		setIsImageLoading( false );
		setImageError( true );
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

	const overlayContent = (
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
				title={ translate( 'Close gallery (Escape)' ) }
			>
				<Gridicon icon="cross" size={ 24 } aria-hidden="true" />
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
								alt={
									currentImage.alt ||
									translate( 'Gallery image %(current)d of %(total)d', {
										args: {
											current: currentIndex + 1,
											total: images.length,
										},
									} )
								}
								className={ clsx( 'gallery-overlay__image', {
									'is-loading': isImageLoading,
								} ) }
								onLoad={ handleImageLoad }
								onLoadStart={ handleImageLoadStart }
								onError={ handleImageError }
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

	// Render the overlay at the document body level to ensure it's above all other elements
	return isOpen ? createPortal( overlayContent, document.body ) : null;
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
