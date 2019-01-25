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
		this.swiperInstance = this.buildSwiper();
	}

	componentDidUpdate( prevProps ) {
		const { align, effect, images } = this.props;

		/* A change in alignment or images only needs an update */
		if ( align !== prevProps.align || ! isEqual( images, prevProps.images ) ) {
			this.swiperInstance.update();
		}
		/* A change in effect requires a full rebuild */
		if ( effect !== prevProps.effect ) {
			const { activeIndex } = this.swiperInstance;
			this.swiperInstance.destroy( true, true );
			this.swiperInstance = this.buildSwiper( activeIndex );
		}
	}

	render() {
		const { className, effect, images } = this.props;

		return (
			<div className={ className } data-effect={ effect }>
				<div className="swiper-container" ref={ this.slideshowRef }>
					<div className="swiper-wrapper">
						{ images.map( ( { alt, caption, id, url } ) => (
							<figure className="swiper-slide atavist-cover-background-color" key={ id }>
								<div className="slide-background atavist-cover-background-color" />
								<img
									alt={ alt }
									className="wp-block-slideshow-image-container"
									data-id={ id }
									src={ url }
								/>
								{ caption && (
									<figcaption className="slideshow-slide-caption">{ caption }</figcaption>
								) }
							</figure>
						) ) }
					</div>
					<div className="swiper-pagination swiper-pagination-white" ref={ this.paginationRef } />
					<div className="swiper-button-prev swiper-button-white" ref={ this.btnPrevRef } />
					<div className="swiper-button-next swiper-button-white" ref={ this.btnNextRef } />
				</div>
			</div>
		);
	}

	buildSwiper = ( initialSlide = 0 ) =>
		// Using refs instead of className-based selectors allows us to
		// have multiple swipers on one page without collisions, and
		// without needing to add IDs or the like.
		createSwiper( this.slideshowRef.current, {
			effect: this.props.effect,
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
		} );
}

export default Slideshow;
