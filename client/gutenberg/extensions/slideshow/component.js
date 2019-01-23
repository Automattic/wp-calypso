/** @format */

/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { isEqual } from 'lodash';
import 'swiper/dist/css/swiper.min.css';

/**
 * Internal dependencies
 */
import createSwiper from './create-swiper';
import SlideshowComponent from './slideshow';

export class Slideshow extends Component {
	static defaultProps = {
		effect: 'slide',
	};

	render() {
		const { align, className, effect, images } = this.props;

		return (
			<SlideshowComponent
				align={ align }
				className={ className }
				effect={ effect }
				images={ images }
			/>
		);
	}

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

	// sizeSlideshow = () => {
	// 	const ratio = Math.max( Math.min( this.props.images[ 0 ].ratio, 16 / 9 ), 1 );
	// 	const sanityHeight = window.innerHeight * 0.8;
	// 	const imageHeight = Math.min( this.swiperInstance.width / ratio, sanityHeight );
	// 	this.setState( { imageHeight } );
	// };
}

export default Slideshow;
