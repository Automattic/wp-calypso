/**
 * External dependencies
 */
import photon from 'photon';
import { __, sprintf } from '@wordpress/i18n';
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Square from './square';
import Mosaic from './mosaic';
import GalleryImage from '../gallery-image';

export default class Layout extends Component {
	photonize( { height, width, url } ) {
		const { layoutStyle } = this.props;
		if ( isSquareishLayout( layoutStyle ) && width && height ) {
			const size = Math.min( width, height );
			return photon( url, { resize: `${ size },${ size }` } );
		}
		return photon( url );
	}

	// This is tricky:
	// - We need to "photonize" to resize the images at appropriate dimensions
	// - The resize will depend on the image size and the layout in some cases
	// - Handlers need to be created by index so that the image changes can be applied correctly.
	//   This is because the images are stored in an array in the block attributes.
	renderImage( img, i ) {
		const {
			columns,
			imageCrop,
			images,
			linkTo,
			onRemoveImage,
			onSelectImage,
			selectedImage,
			setImageAttributes,
		} = this.props;

		/* translators: %1$d is the order number of the image, %2$d is the total number of images. */
		const ariaLabel = __( sprintf( 'image %1$d of %2$d in gallery', i + 1, images.length ) );

		return (
			<GalleryImage
				alt={ img.alt }
				aria-label={ ariaLabel }
				caption={ img.caption }
				className="tiled-gallery__item"
				columns={ columns }
				height={ img.height }
				id={ img.id }
				imageCrop={ imageCrop }
				isSelected={ selectedImage === i }
				key={ i }
				linkTo={ linkTo }
				onRemove={ onRemoveImage( i ) }
				onSelect={ onSelectImage( i ) }
				setAttributes={ setImageAttributes( i ) }
				url={ this.photonize( img ) }
				width={ img.width }
			/>
		);
	}

	render() {
		const { children, className, layoutStyle, images } = this.props;

		// eslint-disable-next-line no-nested-ternary
		const LayoutRenderer = isSquareishLayout( layoutStyle )
			? Square
			: 'columns' === layoutStyle
				? Square
				: Mosaic;

		const renderedImages = this.props.images.map( this.renderImage, this );

		return (
			<div className={ className }>
				<LayoutRenderer
					columns={ this.props.columns }
					images={ images }
					renderedImages={ renderedImages }
				/>
				{ children }
			</div>
		);
	}
}

function isSquareishLayout( layout ) {
	return [ 'circle', 'square' ].includes( layout );
}
