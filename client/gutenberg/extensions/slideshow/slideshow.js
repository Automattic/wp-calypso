/** @format */

/**
 * External dependencies
 */
import { Component, createRef } from '@wordpress/element';
import { isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import createSwiper from './create-swiper';

class Slideshow extends Component {
	static defaultProps = {
		effect: 'slide',
	};

	constructor( props ) {
		super( props );

		this.slideshowRef = createRef();
		this.btnNextRef = createRef();
		this.btnPrevRef = createRef();
		this.paginationRef = createRef();
	}

	componentDidMount() {
		this.buildSwiper().then( swiper => ( this.swiperInstance = swiper ) );
	}

	componentDidUpdate( prevProps ) {
		const { align, effect, images } = this.props;
		if (
			align !== prevProps.align ||
			! isEqual( images, prevProps.images ) ||
			effect !== prevProps.effect
		) {
			const { activeIndex } = this.swiperInstance;
			this.swiperInstance && this.swiperInstance.destroy( true, true );
			this.buildSwiper( activeIndex ).then( swiper => ( this.swiperInstance = swiper ) );
		}
	}

	render() {
		const { aspectRatio, className, effect, images } = this.props;

		return (
			<div className={ className } data-effect={ effect } data-aspect_ratio={ aspectRatio }>
				<div
					className="wp-block-jetpack-slideshow_container swiper-container"
					ref={ this.slideshowRef }
				>
					<div className="swiper-wrapper">
						{ images.map( ( { alt, caption, id, url } ) => (
							<figure className="wp-block-jetpack-slideshow_slide swiper-slide" key={ id }>
								<div className="wp-block-jetpack-slideshow_image-container">
									<img
										alt={ alt }
										className="wp-block-jetpack-slideshow_image"
										data-id={ id }
										src={ url }
									/>
								</div>
								{ caption && (
									<figcaption className="wp-block-jetpack-slideshow_caption">
										{ caption }
									</figcaption>
								) }
							</figure>
						) ) }
					</div>
					<div
						className="wp-block-jetpack-slideshow_pagination swiper-pagination swiper-pagination-white"
						ref={ this.paginationRef }
					/>
					<div
						className="wp-block-jetpack-slideshow_button-prev swiper-button-prev swiper-button-white"
						ref={ this.btnPrevRef }
					/>
					<div
						className="wp-block-jetpack-slideshow_button-next swiper-button-next swiper-button-white"
						ref={ this.btnNextRef }
					/>
				</div>
			</div>
		);
	}

	buildSwiper = ( initialSlide = 0 ) =>
		// Using refs instead of className-based selectors allows us to
		// have multiple swipers on one page without collisions, and
		// without needing to add IDs or the like.
		createSwiper(
			this.slideshowRef.current,
			{
				effect: this.props.effect,
				initialSlide,
				navigation: {
					nextEl: this.btnNextRef.current,
					prevEl: this.btnPrevRef.current,
				},
				observer: true,
				pagination: {
					clickable: true,
					el: this.paginationRef.current,
					type: 'bullets',
				},
			},
			this.props.aspectRatio
		);
}

export default Slideshow;
