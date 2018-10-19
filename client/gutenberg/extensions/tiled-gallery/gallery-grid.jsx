/** @format */

/**
 * External dependencies
 */
import { Component, Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { getLayout } from './layouts';

class TiledGalleryGrid extends Component {
	render() {
		const { columns, images, layout, renderGalleryImage } = this.props;

		const rows = getLayout( { columns, images, layout } );

		let imageIndex = 0;

		return (
			<Fragment>
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
								const galleryItem = (
									<div
										className="tiled-gallery__item"
										key={ images[ imageIndex ].id || images[ imageIndex ].url }
										style={ {
											width: tile.width,
											height: tile.height,
										} }
									>
										{ renderGalleryImage( imageIndex ) }
									</div>
								);

								imageIndex++;

								return galleryItem;
							} ) }
						</div>
					);
				} ) }
			</Fragment>
		);
	}
}

export default TiledGalleryGrid;
