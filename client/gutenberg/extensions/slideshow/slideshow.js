/**
 * External dependencies
 */
import { Component, createRef } from '@wordpress/element';
import { isEqual } from 'lodash';
import ResizeObserver from 'resize-observer-polyfill';

/**
 * Internal dependencies
 */
import createSwiper from './create-swiper';
import swiperResize from './swiper-resize';

class Slideshow extends Component {
	pendingRequestAnimationFrame = null;
	resizeObserver = null;
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
		this.buildSwiper().then( swiper => {
			this.swiperInstance = swiper;
			this.initializeResizeObserver( swiper );
		} );
	}

	componentWillUnmount() {
		this.clearResizeObserver();
		this.clearPendingRequestAnimationFrame();
	}

	componentDidUpdate( prevProps ) {
		const { align, autoplay, delay, effect, images } = this.props;

		/* A change in alignment or images only needs an update */
		if ( align !== prevProps.align || ! isEqual( images, prevProps.images ) ) {
			this.swiperInstance && this.swiperInstance.update();
		}
		/* A change in effect requires a full rebuild */
		if (
			effect !== prevProps.effect ||
			autoplay !== prevProps.autoplay ||
			delay !== prevProps.delay
		) {
			const { activeIndex } = this.swiperInstance;
			this.swiperInstance && this.swiperInstance.destroy( true, true );
			this.buildSwiper( activeIndex ).then( swiper => {
				this.swiperInstance = swiper;
				this.initializeResizeObserver( swiper );
			} );
		}
	}

	initializeResizeObserver = swiper => {
		this.clearResizeObserver();
		this.resizeObserver = new ResizeObserver( () => {
			this.clearPendingRequestAnimationFrame();
			this.pendingRequestAnimationFrame = requestAnimationFrame( () => {
				swiperResize( swiper );
				swiper.update();
			} );
		} );
		this.resizeObserver.observe( swiper.el );
	};

	clearPendingRequestAnimationFrame = () => {
		if ( this.pendingRequestAnimationFrame ) {
			cancelAnimationFrame( this.pendingRequestAnimationFrame );
			this.pendingRequestAnimationFrame = null;
		}
	};

	clearResizeObserver = () => {
		if ( this.resizeObserver ) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}
	};

	render() {
		const { autoplay, className, delay, effect, images } = this.props;
		// Note: React omits the data attribute if the value is null, but NOT if it is false.
		// This is the reason for the unusual logic related to autoplay below.
		return (
			<div
				className={ className }
				data-autoplay={ autoplay || null }
				data-delay={ autoplay ? delay : null }
				data-effect={ effect }
			>
				<div
					className="wp-block-jetpack-slideshow_container swiper-container"
					ref={ this.slideshowRef }
				>
					<div className="swiper-wrapper">
						{ images.map( ( { alt, caption, id, url } ) => (
							<figure className="wp-block-jetpack-slideshow_slide swiper-slide" key={ id }>
								<img
									alt={ alt }
									className="wp-block-jetpack-slideshow_image"
									data-id={ id }
									src={ url }
								/>
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
				autoplay: this.props.autoplay
					? {
							delay: this.props.delay * 1000,
					  }
					: false,
				effect: this.props.effect,
				loop: true,
				initialSlide,
				navigation: {
					nextEl: this.btnNextRef.current,
					prevEl: this.btnPrevRef.current,
				},
				pagination: {
					clickable: true,
					el: this.paginationRef.current,
					type: 'bullets',
				},
			},
			{
				init: swiperResize,
				imagesReady: swiperResize,
			}
		);
}

export default Slideshow;
