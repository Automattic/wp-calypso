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
import { getLayout } from './layouts';

export default ( { attributes, className } ) => {
	const {
		columns = defaultColumnsNumber( attributes ),
		imageCrop,
		images,
		layout,
		linkTo,
	} = attributes;

	const rows = getLayout( { layout, columns, images } );
	let imageIndex = 0;

	// @TODO why is this not getting set dynamicly?
	className = 'wp-block-a8c-tiled-gallery';

	return (
		<Fragment>
			<div
				className={ classnames( className, `columns-${ columns }`, {
					'is-cropped': imageCrop,
				} ) }
			>
				{ rows.map( ( row, rowIndex ) => {
					return (
						<div
							key={ `tiled-gallery-row-${ rowIndex }` }
							className="tiled-gallery__row"
							style={ {
								width: row.width,
								height: row.height,
							} }
						>
							{ row.tiles.map( tile => {
								let href;
								const image = images[ imageIndex ];

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

								const galleryItem = (
									<div
										key={ image.id || image.url }
										className="tiled-gallery__item"
										style={ {
											width: tile.width,
											height: tile.height,
										} }
									>
										<figure>
											{ href ? <a href={ href }>{ img }</a> : img }
											{ layout !== 'circle' &&
												! RichText.isEmpty( image.caption ) && (
													<RichText.Content tagName="figcaption" value={ image.caption } />
												) }
										</figure>
									</div>
								);

								imageIndex++;

								return galleryItem;
							} ) }
						</div>
					);
				} ) }
			</div>
		</Fragment>
	);
};
