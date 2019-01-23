/** @format */

/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import classnames from 'classnames';
import { isEqual } from 'lodash';
import 'swiper/dist/css/swiper.min.css';

/**
 * Internal dependencies
 */
import createSwiper from './create-swiper';
import SlideshowComponent from './slideshow';

export class Slideshow extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			imageHeight: 400,
		};
	}

	render() {
		const { align, className, effect, images } = this.props;
		const { imageHeight } = this.state;

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
		this.buildSwiper();
	}

	componentDidUpdate( prevProps ) {
		const { swiperInstance } = this.state;
		const { align, effect, images } = this.props;
		if ( ! isEqual( images, prevProps.images ) ) {
			this.sizeSlideshow();
		}
		/* A change in alignment or images only needs an update */
		if ( align !== prevProps.align || ! isEqual( images, prevProps.images ) ) {
			swiperInstance.update();
		}
		/* A change in effect requires a full rebuild */
		if ( effect !== prevProps.effect ) {
			const activeIndex = swiperInstance.activeIndex;
			swiperInstance.destroy( true, true );
			this.buildSwiper( activeIndex );
		}
	}

	buildSwiper = ( initialSlide = 0 ) => {
		const { effect } = this.props;
		const swiperInstance = createSwiper( { effect, init: false, initialSlide } );
		this.setState(
			{
				swiperInstance,
			},
			() => {
				swiperInstance.init();
				this.sizeSlideshow();
			}
		);
	};

	sizeSlideshow = () => {
		const { swiperInstance } = this.state;
		const ratio = Math.max( Math.min( this.props.images[ 0 ].ratio, 16 / 9 ), 1 );
		const sanityHeight = window.innerHeight * 0.8;
		const imageHeight = Math.min( swiperInstance.width / ratio, sanityHeight );
		this.setState( { imageHeight } );
	};
}

Slideshow.defaultProps = {
	effect: 'slide',
};

export default Slideshow;
