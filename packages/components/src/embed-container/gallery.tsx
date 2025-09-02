import { useState, useEffect, useCallback } from '@wordpress/element';
import { Icon, arrowRight, close } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate, useRtl } from 'i18n-calypso';

import './gallery-style.scss';

interface GalleryImage {
	src: string;
	alt?: string;
	srcSet?: string;
}

interface GalleryProps {
	images: GalleryImage[];
	initialIndex?: number;
	onClose: () => void;
}

const GalleryModal = ( {
	images,
	isOpen,
	onClose,
	initialIndex = 0,
}: {
	images: GalleryImage[];
	isOpen: boolean;
	onClose: () => void;
	initialIndex?: number;
} ) => {
	const translate = useTranslate();
	const isRtl = useRtl();
	const [ currentIndex, setCurrentIndex ] = useState( initialIndex );

	const goToPrevious = useCallback( () => {
		setCurrentIndex( ( prev ) => ( prev === 0 ? images.length - 1 : prev - 1 ) );
	}, [ images.length ] );

	const goToNext = useCallback( () => {
		setCurrentIndex( ( prev ) => ( prev === images.length - 1 ? 0 : prev + 1 ) );
	}, [ images.length ] );

	useEffect( () => {
		if ( isOpen ) {
			setCurrentIndex( initialIndex );
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.body.style.overflow = '';
		};
	}, [ isOpen, initialIndex ] );

	useEffect( () => {
		const handleKeyDown = ( e: KeyboardEvent ) => {
			if ( ! isOpen ) {
				return;
			}

			if ( e.key === 'Escape' ) {
				onClose();
			} else if ( e.key === 'ArrowLeft' ) {
				goToPrevious();
			} else if ( e.key === 'ArrowRight' ) {
				goToNext();
			}
		};

		document.addEventListener( 'keydown', handleKeyDown );
		return () => document.removeEventListener( 'keydown', handleKeyDown );
	}, [ isOpen, onClose, goToPrevious, goToNext ] );

	const goToIndex = ( index: number ) => {
		setCurrentIndex( index );
	};

	if ( ! isOpen ) {
		return null;
	}

	const currentImage = images[ currentIndex ];

	return (
		<div className="gallery-modal-overlay" role="dialog" aria-modal="true">
			<button
				className="gallery-modal-overlay-backdrop"
				onClick={ onClose }
				aria-label={ translate( 'Close gallery' ) }
			/>
			<div className="gallery-modal-container" role="document">
				<button
					className="gallery-modal-close"
					onClick={ onClose }
					aria-label={ translate( 'Close gallery' ) }
				>
					<Icon icon={ close } size={ 24 } />
				</button>

				<div className="gallery-modal-content">
					<button
						className="gallery-modal-arrow gallery-modal-arrow-prev"
						onClick={ goToPrevious }
						aria-label={ translate( 'Previous image' ) }
					>
						<Icon
							icon={ arrowRight }
							size={ 32 }
							style={ ! isRtl ? { transform: 'scaleX(-1)' } : undefined }
						/>
					</button>

					<div className="gallery-modal-image-container">
						<img
							className="gallery-modal-image"
							src={ currentImage.src }
							alt={ currentImage.alt || '' }
							srcSet={ currentImage.srcSet }
						/>
					</div>

					<button
						className="gallery-modal-arrow gallery-modal-arrow-next"
						onClick={ goToNext }
						aria-label={ translate( 'Next image' ) }
					>
						<Icon
							icon={ arrowRight }
							size={ 32 }
							style={ isRtl ? { transform: 'scaleX(-1)' } : undefined }
						/>
					</button>
				</div>

				<div className="gallery-modal-info">
					<div className="gallery-modal-counter">
						{ translate( '%(current)d of %(total)d', {
							args: { current: currentIndex + 1, total: images.length },
						} ) }
					</div>
					<div className="gallery-modal-dots">
						{ images.map( ( _, index ) => (
							<button
								key={ index }
								className={ clsx( 'gallery-modal-dot', {
									'gallery-modal-dot-active': index === currentIndex,
								} ) }
								onClick={ () => goToIndex( index ) }
								aria-label={
									translate( 'Go to image %(number)d', { args: { number: index + 1 } } ) as string
								}
							/>
						) ) }
					</div>
				</div>
			</div>
		</div>
	);
};

const Gallery = ( { images, initialIndex = 0, onClose }: GalleryProps ) => {
	return (
		<GalleryModal images={ images } isOpen onClose={ onClose } initialIndex={ initialIndex } />
	);
};

export default Gallery;
