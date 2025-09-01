import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import './gallery-overlay.scss';

const GalleryOverlay = ( { isOpen, images, currentIndex, onClose, onNext, onPrevious } ) => {
	const translate = useTranslate();
	const [ isImageLoading, setIsImageLoading ] = useState( false );

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
					onPrevious();
					break;
				case 'ArrowRight':
					onNext();
					break;
				case ' ':
				case 'Enter':
					onClose();
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
	}, [ isOpen, onClose, onNext, onPrevious ] );

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

	if ( ! isOpen || ! images.length ) {
		return null;
	}

	const currentImage = images[ currentIndex ];
	const hasMultipleImages = images.length > 1;
	const hasPrevious = currentIndex > 0;
	const hasNext = currentIndex < images.length - 1;

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
				<div className="gallery-overlay__image-container">
					{ isImageLoading && (
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

				{ /* Image counter and caption */ }
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
		} )
	).isRequired,
	currentIndex: PropTypes.number.isRequired,
	onClose: PropTypes.func.isRequired,
	onNext: PropTypes.func.isRequired,
	onPrevious: PropTypes.func.isRequired,
};

export default GalleryOverlay;
