/** @format */

/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import classnames from 'classnames';
import { isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import createSwiper from './create-swiper';

class Slideshow extends Component {
	static defaultProps = {
		effect: 'slide',
	};

	componentDidMount() {
		const { effect } = this.props;
		this.swiperInstance = createSwiper( { effect } );
	}

	componentDidUpdate( prevProps ) {
		const { align, effect, images } = this.props;
		if ( ! isEqual( images, prevProps.images ) ) {
			this.sizeSlideshow();
		}
		/* A change in alignment or images only needs an update */
		if ( align !== prevProps.align || ! isEqual( images, prevProps.images ) ) {
			this.swiperInstance.update();
		}
		/* A change in effect requires a full rebuild */
		if ( effect !== prevProps.effect ) {
			const { activeIndex } = this.swiperInstance;
			this.swiperInstance.destroy( true, true );
			this.swiperInstance = createSwiper( { effect, initialSlide: activeIndex } );
		}
	}

	render() {
		const { align, className, effect, images } = this.props;
		const alignClassName = align ? `align${ align }` : null;
		const classes = classnames( className, alignClassName );
		const swiperClassNames = classnames( className, 'swiper-container' );

		return (
			<div className={ classes } effect={ effect }>
				<div className={ swiperClassNames }>
					<div className="swiper-wrapper">
						{ images.map( ( { alt, caption, id, url } ) => (
							<figure className="swiper-slide atavist-cover-background-color" key={ id }>
								<div className="slide-background atavist-cover-background-color" />
								<img alt={ alt } className="wp-block-slideshow-image-container" src={ url } />
								{ caption && (
									<figcaption className="slideshow-slide-caption">{ caption }</figcaption>
								) }
							</figure>
						) ) }
					</div>
					<div className="swiper-pagination swiper-pagination-white" />
					<div className="swiper-button-prev swiper-button-white" />
					<div className="swiper-button-next swiper-button-white" />
				</div>
			</div>
		);
	}
}

export default Slideshow;
