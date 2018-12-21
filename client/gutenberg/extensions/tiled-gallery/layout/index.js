/**
 * External dependencies
 */
import photon from 'photon';
import { Component } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import GalleryImageEdit from '../gallery-image/edit';
import GalleryImageSave from '../gallery-image/save';
import Mosaic from './mosaic';
import Square from './square';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

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
			images,
			isSave,
			linkTo,
			onRemoveImage,
			onSelectImage,
			selectedImage,
			setImageAttributes,
		} = this.props;

		/* translators: %1$d is the order number of the image, %2$d is the total number of images. */
		const ariaLabel = __( sprintf( 'image %1$d of %2$d in gallery', i + 1, images.length ) );
		const Image = isSave ? GalleryImageSave : GalleryImageEdit;

		return (
			<Image
				alt={ img.alt }
				aria-label={ ariaLabel }
				caption={ img.caption }
				className="tiled-gallery__item"
				height={ img.height }
				id={ img.id }
				origUrl={ img.url }
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
		const {
			children,
			className,
			columns,
			images,
			isSave,
			isWide,
			layoutStyle,
			linkTo,
			onRemoveImage,
			onSelectImage,
			selectedImage,
			setImageAttributes,
		} = this.props;

		// eslint-disable-next-line no-nested-ternary
		const LayoutRenderer = isSquareishLayout( layoutStyle )
			? Square
			: 'columns' === layoutStyle
				? Square
				: Mosaic;

		const renderedImages = this.props.images.map( this.renderImage, this );
		const ImageComponent = isSave ? GalleryImageSave : GalleryImageEdit;

		return (
			<div className={ className }>
				<LayoutRenderer
					columns={ columns }
					ImageComponent={ ImageComponent }
					images={ images }
					isSave={ isSave }
					isWide={ isWide }
					linkTo={ linkTo }
					onRemoveImage={ onRemoveImage }
					onSelectImage={ onSelectImage }
					renderedImages={ renderedImages }
					selectedImage={ selectedImage }
					setImageAttributes={ setImageAttributes }
				/>
				{ children }
			</div>
		);
	}
}

function isSquareishLayout( layout ) {
	return [ 'circle', 'square' ].includes( layout );
}
