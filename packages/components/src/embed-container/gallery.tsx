import { Icon, close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { Virtual, Navigation, Keyboard } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/virtual';
import 'swiper/css/navigation';

import './gallery-style.scss';

interface CarouselImage {
	src: string;
	alt?: string;
	srcSet?: string;
	originalFile?: string;
}

interface ImageCarouselProps {
	images: CarouselImage[];
	initialIndex?: number;
	onClose: () => void;
}

const ImageCarouselModal = ( {
	images,
	isOpen,
	onClose,
	initialIndex = 0,
}: {
	images: CarouselImage[];
	isOpen: boolean;
	onClose: () => void;
	initialIndex?: number;
} ) => {
	const translate = useTranslate();

	if ( ! isOpen ) {
		return null;
	}

	return (
		<div className="reader-image-carousel-container">
			<Swiper
				className="reader-image-carousel-wrap"
				modules={ [ Virtual, Navigation, Keyboard ] }
				keyboard={ { enabled: true } }
				virtual
				navigation
				centeredSlides
				initialSlide={ initialIndex || 0 }
				spaceBetween={ 150 }
				slidesPerView={ 1 }
			>
				{ images.map( ( image, index ) => (
					<SwiperSlide key={ index } virtualIndex={ index }>
						<img
							src={ image.originalFile ? image.originalFile + '?w=2000' : image.src }
							alt={ image.alt || '' }
						/>
					</SwiperSlide>
				) ) }
			</Swiper>

			<button
				className="reader-image-carousel-close"
				onClick={ onClose }
				aria-label={ translate( 'Close carousel' ) }
			>
				<Icon icon={ close } size={ 24 } style={ { fill: '#fff' } } />
			</button>
			<div className="reader-image-carousel-footer">
				<div className="reader-image-carousel-pagination-container">
					<div className="reader-image-carousel-pagination">
						<span>
							{ 1 } / { images.length }
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

const ImageCarousel = ( { images, initialIndex = 0, onClose }: ImageCarouselProps ) => {
	return (
		<ImageCarouselModal
			images={ images }
			isOpen
			onClose={ onClose }
			initialIndex={ initialIndex }
		/>
	);
};

export default ImageCarousel;
