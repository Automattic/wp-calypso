/** @format */

/**
 * External dependencies
 */
import { RichText } from '@wordpress/editor';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { defaultColumnsNumber } from './edit';
import GalleryGrid from './gallery-grid';
import { getActiveStyleName } from 'gutenberg/extensions/utils';

export default ( { attributes } ) => {
	const {
		align,
		className,
		columns = defaultColumnsNumber( attributes ),
		imageCrop,
		images,
		linkTo,
	} = attributes;

	const layout = getActiveStyleName( className );

	const renderGalleryImage = index => {
		if ( ! images[ index ] ) {
			return null;
		}

		const image = images[ index ];

		let href;

		switch ( linkTo ) {
			case 'media':
				href = image.url;
				break;
			case 'attachment':
				href = image.link;
				break;
		}

		const img = (
			<img
				alt={ image.alt }
				className={ classnames( {
					[ `wp-image-${ image.id }` ]: image.id,
				} ) }
				data-id={ image.id }
				data-link={ image.link }
				src={ image.url }
			/>
		);

		return (
			<figure>
				{ href ? <a href={ href }>{ img }</a> : img }
				{ layout !== 'circle' &&
					image.caption &&
					image.caption.length > 0 && (
						<RichText.Content tagName="figcaption" value={ image.caption } />
					) }
			</figure>
		);
	};

	return (
		<GalleryGrid
			align={ align }
			className={ `wp-block-jetpack-tiled-gallery ${ className }` }
			columns={ columns }
			imageCrop={ imageCrop }
			images={ images }
			layout={ layout }
			renderGalleryImage={ renderGalleryImage }
			noResize
		/>
	);
};
