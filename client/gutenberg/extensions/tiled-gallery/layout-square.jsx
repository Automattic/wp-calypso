/** @format */

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import TiledGalleryItem from './item.jsx';

// hard coded for now - ideally we'd inject $content_width
// not sure how critical this is, likely necessary to work nicely with themes
const CONTENT_WIDTH = 520;

function TiledGallerySquareGroup( {
	group_size,
	id,
	url,
	link,
	width,
	height,
	caption,
	linkTo,
	setAttributes,
} ) {
	const styleAttr = {
		width: group_size + 'px',
		height: group_size + 'px',
	};
	return (
		<div
			className="tiled-gallery__group"
			style={ styleAttr }
			data-original-width={ group_size }
			data-original-height={ group_size }
		>
			<TiledGalleryItem
				id={ id }
				url={ url }
				alt={ id }
				link={ link }
				width={ width }
				height={ height }
				setAttributes={ setAttributes }
				caption={ caption }
				linkTo={ linkTo }
			/>
		</div>
	);
}

class TiledGalleryLayoutSquare extends Component {
	computeItems() {
		const { columns, images } = this.props;

		const content_width = CONTENT_WIDTH; // todo: get content width
		const images_per_row = columns > 1 ? columns : 1;
		const margin = 2;

		const margin_space = images_per_row * margin * 2;
		const size = Math.floor( ( content_width - margin_space ) / images_per_row );
		let remainder_size = size;
		let img_size = remainder_size;
		const remainder = images.length % images_per_row;
		let remainder_space = 0;
		if ( remainder > 0 ) {
			remainder_space = remainder * margin * 2;
			remainder_size = Math.floor( ( content_width - remainder_space ) / remainder );
		}

		let c = 1;
		let items_in_row = 0;
		const rows = [];
		let row = {
			images: [],
		};
		for ( const image of images ) {
			if ( remainder > 0 && c <= remainder ) {
				img_size = remainder_size;
			} else {
				img_size = size;
			}

			image.width = image.height = img_size;

			row.images.push( image );
			c++;
			items_in_row++;

			if ( images_per_row === items_in_row || remainder + 1 === c ) {
				rows.push( row );
				items_in_row = 0;

				row.height = img_size + margin * 2;
				row.width = content_width;
				row.group_size = img_size + 2 * margin;

				row = {
					images: [],
				};
			}
		}

		if ( row.images.length > 0 ) {
			row.height = img_size + margin * 2;
			row.width = content_width;
			row.group_size = img_size + 2 * margin;

			rows.push( row );
		}

		return rows;
	}

	render() {
		const rows = this.computeItems();
		const { linkTo, className } = this.props;

		return (
			<div className={ className }>
				<div
					className="tiled-gallery__square tiled-gallery__unresized"
					data-original-width={ CONTENT_WIDTH }
				>
					{ rows.map( ( row, index ) => {
						const styleAttr = {
							width: row.width + 'px',
							height: row.height + 'px',
						};
						const setMyAttributes = attrs => this.setImageAttributes( index, attrs );

						return (
							<div
								key={ index }
								className="tiled-gallery__row"
								style={ styleAttr }
								data-original-width={ row.width }
								data-original-height={ row.height }
							>
								{ row.images.map( image => (
									<TiledGallerySquareGroup
										key={ image.id }
										group_size={ row.group_size }
										id={ image.id }
										url={ image.url }
										link={ image.link }
										width={ image.width }
										height={ image.height }
										caption={ image.caption }
										linkTo={ linkTo }
										setAttributes={ setMyAttributes }
									/>
								) ) }
							</div>
						);
					} ) }
				</div>
			</div>
		);
	}
}

export default TiledGalleryLayoutSquare;
