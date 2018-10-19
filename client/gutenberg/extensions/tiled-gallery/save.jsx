/** @format */

/**
 * External dependencies
 */
import { Fragment } from '@wordpress/element';
import { RichText } from '@wordpress/editor';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { defaultColumnsNumber } from './edit';
import GalleryGrid from './gallery-grid';

export default ( { attributes, className } ) => {
	const {
		columns = defaultColumnsNumber( attributes ),
		imageCrop,
		images,
		layout,
		linkTo,
	} = attributes;

	// @TODO why is this not getting set dynamicly?
	className = 'wp-block-a8c-tiled-gallery';

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
				src={ image.url }
				alt={ image.alt }
				data-id={ image.id }
				data-link={ image.link }
				className={ classnames( {
					[ `wp-image-${ image.id }` ]: image.id,
				} ) }
			/>
		);

		return (
			<figure>
				{ href ? <a href={ href }>{ img }</a> : img }
				{ image.caption &&
					image.caption.length > 0 && (
						<RichText.Content tagName="figcaption" value={ image.caption } />
					) }
			</figure>
		);
	};

	return (
		<Fragment>
			<div
				className={ classnames( className, `columns-${ columns }`, {
					'is-cropped': imageCrop,
				} ) }
			>
				<GalleryGrid
					columns={ columns }
					images={ images }
					layout={ layout }
					renderGalleryImage={ renderGalleryImage }
				/>
			</div>
		</Fragment>
	);
};
