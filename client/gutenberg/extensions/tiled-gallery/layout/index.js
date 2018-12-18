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
import GalleryImage from '../gallery-image';

export default class Layout extends Component {
	photonize( { height, width, url } ) {
		const { layoutStyle } = this.props;
		if ( [ 'circle', 'square' ].includes( layoutStyle ) && width && height ) {
			const size = Math.min( width, height );
			return photon( url, { resize: `${ size },${ size }` } );
		}
		return photon( url );
	}

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
		const { children, className /*layoutStyle*/ } = this.props;

		const renderedImages = this.props.images.map( this.renderImage, this );

		return (
			<div className={ className }>
				<Square columns={ this.props.columns } renderedImages={ renderedImages } />
				{ children }
			</div>
		);
	}
}
