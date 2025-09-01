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
	const [ announcement, setAnnouncement ] = useState( '' );

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
						// Announce navigation to screen readers
						setAnnouncement( translate( 'Navigated to previous image' ) );
					}
					break;
				case 'ArrowRight':
				case 'l': // Vim-style navigation
					if ( hasNext && ! isInteractingWithButton ) {
						event.preventDefault();
						onNext();
						// Announce navigation to screen readers
						setAnnouncement( translate( 'Navigated to next image' ) );
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
					break;
				case 'Home':
					if ( hasMultipleImages && currentIndex > 0 && onGoToFirst && ! isInteractingWithButton ) {
						event.preventDefault();
						onGoToFirst();
						setAnnouncement( translate( 'Navigated to first image' ) );
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
						setAnnouncement( translate( 'Navigated to last image' ) );
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

	// Screen reader announcements for navigation
	useEffect( () => {
		if ( ! isOpen || ! hasMultipleImages ) {
			return;
		}

		const imagePosition = translate( 'Image %(current)d of %(total)d', {
			args: {
				current: currentIndex + 1,
				total: images.length,
			},
		} );

		let announcementText = imagePosition;

		if ( currentImage.alt ) {
			announcementText += `. ${ currentImage.alt }`;
		}

		if ( currentImage.caption ) {
			announcementText += `. ${ currentImage.caption }`;
		}

		// Delay announcement to avoid conflicts with navigation sounds
		const timeoutId = setTimeout( () => {
			setAnnouncement( announcementText );
		}, 300 );

		return () => clearTimeout( timeoutId );
	}, [
		currentIndex,
		isOpen,
		hasMultipleImages,
		currentImage.alt,
		currentImage.caption,
		images.length,
		translate,
	] );

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
			aria-describedby={ hasMultipleImages ? 'gallery-description' : undefined }
		>
			{ /* Screen reader announcements */ }
			<div
				id="gallery-announcements"
				aria-live="polite"
				aria-atomic="true"
				className="gallery-overlay__sr-only"
			>
				{ announcement }
			</div>
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
					aria-label={ translate( 'Previous image (%(current)d of %(total)d)', {
						args: {
							current: currentIndex,
							total: images.length,
						},
					} ) }
					title={ translate( 'Previous image' ) }
				>
					<Gridicon icon="chevron-left" size={ 36 } aria-hidden="true" />
				</button>
			) }

			{ /* Next button */ }
			{ hasMultipleImages && hasNext && (
				<button
					className="gallery-overlay__nav gallery-overlay__nav--next"
					onClick={ onNext }
					aria-label={ translate( 'Next image (%(current)d of %(total)d)', {
						args: {
							current: currentIndex + 2,
							total: images.length,
						},
					} ) }
					title={ translate( 'Next image' ) }
				>
					<Gridicon icon="chevron-right" size={ 36 } aria-hidden="true" />
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
								aria-describedby={ currentImage.caption ? 'gallery-caption' : undefined }
							/>
						) }
					</div>
				) }

				{ /* Image counter and caption */ }
				{ ! error && (
					<div className="gallery-overlay__info">
						{ hasMultipleImages && (
							<div
								id="gallery-description"
								className="gallery-overlay__counter"
								aria-label={ translate( 'Gallery navigation information' ) }
							>
								{ translate( '%(current)d of %(total)d', {
									args: {
										current: currentIndex + 1,
										total: images.length,
									},
								} ) }
							</div>
						) }
						{ currentImage.caption && (
							<div
								id="gallery-caption"
								className="gallery-overlay__caption"
								role="img"
								aria-label={ translate( 'Image caption' ) }
							>
								{ currentImage.caption }
							</div>
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
