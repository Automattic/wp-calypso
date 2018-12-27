/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { isBlobURL } from '@wordpress/blob';
import photon from 'photon';

/**
 * Internal dependencies
 */
import GalleryImageEdit from '../gallery-image/edit';
import GalleryImageSave from '../gallery-image/save';
import Mosaic from './mosaic';
import Square from './square';

// @TODO put in consts?
const PHOTON_MAX_RESIZE = 2000;

export default class Layout extends Component {
	photonize( { height, width, url } ) {
		// Do not Photonize images that are still uploading or from localhost
		if ( isBlobURL( url ) || /^https?:\/\/localhost/.test( url ) ) {
			return url;
		}

		const { layoutStyle } = this.props;
		if ( isSquareishLayout( layoutStyle ) && width && height ) {
			const size = Math.min( PHOTON_MAX_RESIZE, width, height );
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
			isSave,
			linkTo,
			onRemoveImage,
			onSelectImage,
			selectedImage,
			setImageAttributes,
		} = this.props;

		/* translators: %1$d is the order number of the image, %2$d is the total number of images. */
		const ariaLabel = sprintf( __( 'image %1$d of %2$d in gallery' ), i + 1, images.length );
		const Image = isSave ? GalleryImageSave : GalleryImageEdit;

		return (
			<Image
				alt={ img.alt }
				aria-label={ ariaLabel }
				caption={ img.caption }
				columns={ columns }
				height={ img.height }
				id={ img.id }
				origUrl={ img.url }
				imageCrop={ imageCrop }
				isSelected={ selectedImage === i }
				key={ i }
				linkTo={ linkTo }
				onRemove={ isSave ? undefined : onRemoveImage( i ) }
				onSelect={ isSave ? undefined : onSelectImage( i ) }
				setAttributes={ isSave ? undefined : setImageAttributes( i ) }
				url={ this.photonize( img ) }
				width={ img.width }
			/>
		);
	}

	render() {
		const { isWide, children, className, layoutStyle, images } = this.props;

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
					isWide={ isWide }
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
