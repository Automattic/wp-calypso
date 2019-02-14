/**
 * External dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { Component } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import GalleryImageEdit from '../gallery-image/edit';
import GalleryImageSave from '../gallery-image/save';
import Mosaic from './mosaic';
import Square from './square';
import { isSquareishLayout, photonizedImgProps } from '../utils';

export default class Layout extends Component {
	// This is tricky:
	// - We need to "photonize" to resize the images at appropriate dimensions
	// - The resize will depend on the image size and the layout in some cases
	// - Handlers need to be created by index so that the image changes can be applied correctly.
	//   This is because the images are stored in an array in the block attributes.
	renderImage( img, i ) {
		const {
			images,
			isSave,
			layoutStyle,
			linkTo,
			onRemoveImage,
			onSelectImage,
			selectedImage,
			setImageAttributes,
		} = this.props;

		/* translators: %1$d is the order number of the image, %2$d is the total number of images. */
		const ariaLabel = sprintf( __( 'image %1$d of %2$d in gallery' ), i + 1, images.length );
		const Image = isSave ? GalleryImageSave : GalleryImageEdit;

		const { src, srcSet } = photonizedImgProps( img, { layoutStyle } );

		return (
			<Image
				alt={ img.alt }
				aria-label={ ariaLabel }
				// @TODO Caption has been commented out
				// caption={ img.caption }
				height={ img.height }
				id={ img.id }
				isSelected={ selectedImage === i }
				key={ i }
				link={ img.link }
				linkTo={ linkTo }
				onRemove={ isSave ? undefined : onRemoveImage( i ) }
				onSelect={ isSave ? undefined : onSelectImage( i ) }
				origUrl={ img.url }
				setAttributes={ isSave ? undefined : setImageAttributes( i ) }
				srcSet={ srcSet }
				url={ src }
				width={ img.width }
			/>
		);
	}

	render() {
		const { align, children, className, columns, images, layoutStyle } = this.props;

		const LayoutRenderer = isSquareishLayout( layoutStyle ) ? Square : Mosaic;

		const renderedImages = this.props.images.map( this.renderImage, this );

		return (
			<div className={ className }>
				<LayoutRenderer
					align={ align }
					columns={ columns }
					images={ images }
					layoutStyle={ layoutStyle }
					renderedImages={ renderedImages }
				/>
				{ children }
			</div>
		);
	}
}
