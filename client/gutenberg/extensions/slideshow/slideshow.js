/**
 * External dependencies
 */
import { Component, createRef } from '@wordpress/element';
import { isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import createSwiper from './create-swiper';

const SIXTEEN_BY_NINE = 16 / 9;

/**
 * Swiper event handler.
 *
 * A Swiper instance is passed as `this` to this function.
 */
function swiperInit() {
	this.el.classList.add( 'wp-swiper-initialized' );
	swiperAutoSize.bind( this )();
}

/**
 * Swiper event handler.
 *
 * A Swiper instance is passed as `this` to this function.
 */
function swiperAutoSize() {
	const img = this.el.querySelector( '.swiper-slide[data-swiper-slide-index="0"] img' );
	if ( ! img ) {
		return;
	}
	const aspectRatio = img.clientWidth / img.clientHeight;
	const sanityAspectRatio = Math.max( Math.min( aspectRatio, SIXTEEN_BY_NINE ), 1 );
	const sanityHeight = typeof window !== 'undefined' ? window.innerHeight * 0.8 : 600;
	const swiperHeight = Math.min( this.width / sanityAspectRatio, sanityHeight );
	this.el.style.height = `calc( ${ Math.floor( swiperHeight ) }px + 4em )`;
}

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
			this.buildSwiper( activeIndex ).then( swiper => ( this.swiperInstance = swiper ) );
		}
	}

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
		createSwiper( this.slideshowRef.current, {
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
			on: {
				init: swiperInit,
				imagesReady: swiperAutoSize,
				resize: swiperAutoSize,
			},
			pagination: {
				clickable: true,
				el: this.paginationRef.current,
				type: 'bullets',
			},
		} );
}

export default Slideshow;
