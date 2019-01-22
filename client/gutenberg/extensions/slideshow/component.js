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
		this.state = {
			images: [],
			imageHeight: 400,
		};
		this.slideshowRef = createRef();
		this.btnNextRef = createRef();
		this.btnPrevRef = createRef();
		this.paginationRef = createRef();
	}
	render() {
		const { className } = this.props;
		// const { imageHeight } = this.state;
		const classNames = classnames( className, 'swiper-container' );
		return (
			<div className={ classNames } ref={ this.slideshowRef }>
				<div className="swiper-wrapper">{ Children }</div>
				<div className="swiper-pagination swiper-pagination-white" ref={ this.paginationRef } />
				<div className="swiper-button-prev swiper-button-white" ref={ this.btnPrevRef } />
				<div className="swiper-button-next swiper-button-white" ref={ this.btnNextRef } />
			</div>
		);
	}
	componentDidMount() {
		this.buildImageMetadata( this.buildSwiper );
	}
	componentDidUpdate( prevProps ) {
		const { swiperInstance } = this.state;
		const { align, children, effect } = this.props;
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
	buildImageMetadata = callback => {
		const { children } = this.props;
		this.setState(
			{
				images: Children.map( children, child => {
					const image = this.getChildByDataAttribute( child, 'data-is-image' );
					const meta = {
						width: image.props[ 'data-width' ],
						height: image.props[ 'data-height' ],
					};
					meta.ratio = meta.width / meta.height;
					return meta;
				} ),
			},
			callback
		);
	};
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
				this.sizeSlideshow();
			}
		);
	};
	getChildByDataAttribute = ( parent, attributeName ) => {
		const matches = Children.map( parent.props.children, child => {
			if ( child && child.props[ attributeName ] ) {
				return child;
			}
		} );
		return matches && matches.length ? matches[ 0 ] : null;
	};
	sizeSlideshow = () => {
		const { images, swiperInstance } = this.state;
		const ratio = Math.max( Math.min( images[ 0 ].ratio, 16 / 9 ), 1 );
		const sanityHeight = window.innerHeight * 0.8;
		const imageHeight = Math.min( swiperInstance.width / ratio, sanityHeight );
		this.setState( { imageHeight } );
	};
}

Slideshow.defaultProps = {
	effect: 'slide',
};

export default Slideshow;
