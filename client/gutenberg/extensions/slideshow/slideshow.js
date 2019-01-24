/** @format */

/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import classnames from 'classnames';

class Slideshow extends Component {
	render() {
		const { className, align, effect, images } = this.props;
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
