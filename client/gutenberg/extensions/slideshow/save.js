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
				{ images.map( ( image, index ) => {
					const { alt, caption, height, id, url, width } = image;
					return (
						<div className="wp-block-slideshow_image_container" key={ index }>
							<img
								src={ url }
								alt={ alt }
								data-is-image={ true }
								data-id={ id }
								data-height={ height }
								data-width={ width }
							/>
							<figcaption data-is-caption={ true }>{ caption }</figcaption>
						</div>
					);
				} ) }
			</div>
		);
	}
}

export default SlideshowSave;
