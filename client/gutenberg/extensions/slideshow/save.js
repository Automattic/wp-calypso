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
		return (
			<div className={ classes } data-effect={ effect }>
				{ images.map( image => {
					const { alt, caption, id, url } = image;
					const style = {
						backgroundImage: `url(${ url })`,
					};
					return (
						<div className="swiper-slide" key={ id }>
							<div className="slide-background atavist-cover-background-color" />
							<div className="wp-block-slideshow-image-container" style={ style } title={ alt } />
							{ caption && <p className="slideshow-slide-caption">{ caption }</p> }
						</div>
					);
				} ) }
			</div>
		);
	}
}

export default SlideshowSave;
