/** @format */

/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import classnames from 'classnames';

class SlideshowSave extends Component {
	render() {
		const { attributes, className } = this.props;
		const { align, effect, images } = attributes;
		const alignClassName = align ? `align${ align }` : null;
		const classes = classnames( className, alignClassName );
		const swiperClassNames = classnames( className, 'swiper-container' );

		return (
			<div className={ classes } effect={ effect }>
				<div className={ swiperClassNames }>
					<div className="swiper-wrapper">
						{ images.map( ( image, index ) => {
							const { alt, caption, height, id, url, width } = image;

							//const caption = figcaption ? figcaption.props.children : null;
							const style = {
								backgroundImage: `url(${ url })`,
								height: 400, // TODO
							};
							return (
								<div className="swiper-slide">
									<div className="slide-background atavist-cover-background-color" />
									<div
										className="wp-block-slideshow-image-container"
										style={ style }
										title={ alt }
									/>
									{ caption && <p className="slideshow-slide-caption">{ caption }</p> }
								</div>
							);
						} ) }
					</div>
					<div className="swiper-pagination swiper-pagination-white" />
					<div className="swiper-button-prev swiper-button-white" />
					<div className="swiper-button-next swiper-button-white" />
				</div>
			</div>
		);
	}
}

export default SlideshowSave;
