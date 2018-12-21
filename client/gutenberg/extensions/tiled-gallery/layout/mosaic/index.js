/**
 * External dependencies
 */
import photon from 'photon';
import { sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Column from '../column';
import Row from '../row';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { imagesToRatios, ratiosToRows } from './ratios';

export default function Mosaic( {
	ImageComponent,
	images,
	isSave,
	isWide,
	linkTo,
	onRemoveImage,
	onSelectImage,
	selectedImage,
	setImageAttributes,
} ) {
	const ratios = imagesToRatios( images );
	const rows = ratiosToRows( ratios, { isWide } );

	let cursor = 0;
	return rows.map( ( row, rowIndex ) => {
		const cols = row.map( ( colSize, colIndex ) => {
			const colImages = images.slice( cursor, cursor + colSize );
			const colRatios = ratios.slice( cursor, cursor + colSize );

			const imageEls = colImages.map( ( img, imgIndex ) => {
				// We need to adjust so that the index aligns with position in the attributes array
				// We add the offset to our index here.
				const i = cursor + imgIndex;

				/* translators: %1$d is the order number of the image, %2$d is the total number of images. */
				const ariaLabel = __( sprintf( 'image %1$d of %2$d in gallery', i + 1, images.length ) );
				return (
					<ImageComponent
						alt={ img.alt }
						aria-label={ ariaLabel }
						caption={ img.caption }
						className="tiled-gallery__item"
						height={ img.height }
						id={ img.id }
						isSelected={ selectedImage === i }
						key={ i }
						linkTo={ linkTo }
						onRemove={ isSave ? undefined : onRemoveImage( i ) }
						onSelect={ isSave ? undefined : onSelectImage( i ) }
						origUrl={ img.url }
						setAttributes={ isSave ? undefined : setImageAttributes( i ) }
						url={ photonize( img ) }
						width={ img.width }
					/>
				);
			} );

			cursor += colSize;
			return <Column key={ colIndex }>{ imageEls }</Column>;
		} );
		return <Row key={ rowIndex }>{ cols }</Row>;
	} );
}

function photonize( /* img */ { height, width, url }, /* adjusted dimensions */ X ) {
	if ( false ) {
		const size = Math.min( width, height );
		return photon( url, { resize: `${ size },${ size }` } );
	}
	return photon( url );
}
