/** @format */

/**
 * External Dependencies
 */
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { TILE_MARGIN } from './constants';

const squareLayout = ( { columns, margin, maxWidth, images } ) => {
	const tileCount = images.length;
	const tilesPerRow = columns > 1 ? columns : 1;
	const marginSpace = tilesPerRow * margin * 2;
	const size = Math.floor( ( maxWidth - marginSpace ) / tilesPerRow );
	let remainderSize = size;
	let tileSize = remainderSize;
	const remainder = tileCount % tilesPerRow;
	let remainderSpace = 0;

	if ( remainder > 0 ) {
		remainderSpace = remainder * margin * 2;
		remainderSize = Math.floor( ( maxWidth - remainderSpace ) / remainder );
	}

	let c = 1;
	let tilesInRow = 0;
	const rows = [];
	let row = {
		tiles: [],
	};

	for ( let i = 0; i < tileCount; i++ ) {
		if ( remainder > 0 && c <= remainder ) {
			tileSize = remainderSize;
		} else {
			tileSize = size;
		}

		row.tiles.push( {
			height: tileSize,
			width: tileSize,
		} );

		c++;
		tilesInRow++;

		if ( tilesPerRow === tilesInRow || remainder + 1 === c ) {
			rows.push( row );
			tilesInRow = 0;

			row.height = tileSize + margin * 2;
			row.width = maxWidth;
			row.groupSize = tileSize + 2 * margin;

			row = {
				tiles: [],
			};
		}
	}

	if ( row.tiles.length > 0 ) {
		row.height = tileSize + margin * 2;
		row.width = maxWidth;
		row.groupSize = tileSize + 2 * margin;

		rows.push( row );
	}

	return rows;
};

// @TODO
const rectangularLayout = options => squareLayout( options );
const columnsLayout = options => squareLayout( options );

export const getLayout = ( { columns, images, layout } ) => {
	if ( ! images.length ) {
		return [];
	}

	const { getEditorSettings } = select( 'core/editor' );
	const editorSettings = getEditorSettings();

	const layoutOptions = {
		columns,
		maxWidth: editorSettings.maxWidth,
		images,
		margin: TILE_MARGIN,
	};

	switch ( layout ) {
		case 'square':
			return squareLayout( layoutOptions );
		case 'circle':
			// Circle and square layouts are identical by size calculations
			return squareLayout( layoutOptions );
		case 'columns':
			return columnsLayout( layoutOptions );
		case 'rectangular':
		default:
			return rectangularLayout( layoutOptions );
	}
};
