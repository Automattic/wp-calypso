/**
 * External dependencies
 */
import photon from 'photon';
import { __, sprintf } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { format as formatUrl, parse as parseUrl } from 'url';
import { isBlobURL } from '@wordpress/blob';

/**
 * Internal dependencies
 */
import GalleryImageEdit from '../gallery-image/edit';
import GalleryImageSave from '../gallery-image/save';
import Mosaic from './mosaic';
import Square from './square';
import { PHOTON_MAX_RESIZE } from '../constants';

export default class Layout extends Component {
	photonize( { height, width, url } ) {
		// Do not Photonize images that are still uploading or from localhost
		if ( isBlobURL( url ) || /^https?:\/\/localhost/.test( url ) ) {
			return url;
		}

		// Drop query args, photon URLs can't handle them
		// This should be the "raw" url, we'll add dimensions later
		const cleanUrl = url.split( '?', 1 )[ 0 ];

		const photonImplementation = isWpcomFilesUrl( url ) ? photonWpcomImage : photon;

		const { layoutStyle } = this.props;

		if ( isSquareishLayout( layoutStyle ) && width && height ) {
			const size = Math.min( PHOTON_MAX_RESIZE, width, height );
			return photonImplementation( cleanUrl, { resize: `${ size },${ size }` } );
		}
		return photonImplementation( cleanUrl );
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
		const ariaLabel = sprintf( __( 'image %1$d of %2$d in gallery' ), i + 1, images.length );
		const Image = isSave ? GalleryImageSave : GalleryImageEdit;

		return (
			<Image
				alt={ img.alt }
				aria-label={ ariaLabel }
				// @TODO Caption has been commented out
				// caption={ img.caption }
				height={ img.height }
				id={ img.id }
				origUrl={ img.url }
				isSelected={ selectedImage === i }
				key={ i }
				link={ img.link }
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

function isSquareishLayout( layout ) {
	return [ 'circle', 'square' ].includes( layout );
}

function isWpcomFilesUrl( url ) {
	const { host } = parseUrl( url );
	return /\.files\.wordpress\.com$/.test( host );
}

function photonWpcomImage( url, opts ) {
	// Adhere to the same API as the photon.js lib
	const photonLibMappings = {
		width: 'w',
		height: 'h',
		letterboxing: 'lb',
		removeLetterboxing: 'ulb',
	};

	// Discard auth, port, query, search
	const { auth, port, query, search, ...params } = parseUrl( url );

	// Build query
	// This reduction intentionally mutates the query as it is built internally.
	params.query = Object.keys( opts ).reduce(
		( q, key ) =>
			Object.assign( q, {
				[ photonLibMappings.hasOwnProperty( key ) ? photonLibMappings[ key ] : key ]: opts[ key ],
			} ),
		{}
	);

	return formatUrl( params );
}
