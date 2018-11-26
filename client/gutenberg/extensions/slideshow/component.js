/** @format */

/**
 * External dependencies
 */
import { createRef, Children, Component } from '@wordpress/element';
import classnames from 'classnames';

/**
 * Internal dependencies
 */

import Swiper from 'swiper';
import 'swiper/dist/css/swiper.min.css';

export class Slideshow extends Component {
	constructor() {
		super( ...arguments );
		this.slideshowRef = createRef();
		this.btnNextRef = createRef();
		this.btnPrevRef = createRef();
		this.paginationRef = createRef();
	}
	render() {
		const { children, className } = this.props;
		const classNames = classnames( className, 'swiper-container' );
		return (
			<div className={ classNames } ref={ this.slideshowRef }>
				<div className="swiper-wrapper">
					{ Children.map( children, child => {
						if ( ! child.props.children ) {
							return null;
						}
						const img = child.props.children[ 0 ];
						const figcaption = child.props.children[ 1 ];
						const { src, alt } = img.props;
						const { caption } = figcaption.props.children;
						const style = {
							backgroundImage: `url(${ src })`,
						};
						return (
							<div className="swiper-slide">
								<div className="slide-background atavist-cover-background-color" />
								<div className="wp-block-slideshow-image-container" style={ style } title={ alt } />
								<p className="slideshow-slide-caption">{ caption }</p>
							</div>
						);
					} ) }
				</div>
				<div className="swiper-pagination swiper-pagination-white" ref={ this.paginationRef } />
				<div className="swiper-button-prev swiper-button-white" ref={ this.btnPrevRef } />
				<div className="swiper-button-next swiper-button-white" ref={ this.btnNextRef } />
			</div>
		);
	}
	componentDidMount() {
		this.buildSwiper();
	}
	componentWillUnmount() {}
	componentDidUpdate( prevProps ) {
		const { swiperInstance } = this.state;
		const { align, effect, children } = this.props;
		/* A change in alignment or images only needs an update */
		if ( align !== prevProps.align || children !== prevProps.children ) {
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
		const swiperInstance = new Swiper( this.slideshowRef.current, {
			effect: effect,
			grabCursor: true,
			init: false,
			initialSlide: initialSlide,
			navigation: {
				nextEl: this.btnNextRef.current,
				prevEl: this.btnPrevRef.current,
			},
			pagination: {
				clickable: true,
				el: this.paginationRef.current,
				type: 'bullets',
			},
			preventClicksPropagation: false /* Necessary for normal block interactions */,
			releaseFormElements: false,
			setWrapperSize: true,
			touchStartPreventDefault: false,
		} );
		this.setState(
			{
				swiperInstance,
			},
			() => {
				swiperInstance.init();
			}
		);
	};
}

Slideshow.defaultProps = {
	effect: 'slide',
};

export default Slideshow;
