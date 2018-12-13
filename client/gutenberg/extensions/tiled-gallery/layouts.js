/** @format */

/**
 * External dependencies
 */
import { find } from 'lodash';
import TokenList from '@wordpress/token-list';

/**
 * Internal dependencies
 */
import { LAYOUT_STYLES, MAX_COLUMNS, TILE_MARGIN } from './constants';

const squareLayout = ( { columns, margin, width, tileCount } ) => {
	columns = Math.min( MAX_COLUMNS, columns );
	const tilesPerRow = columns > 1 ? columns : 1;
	const marginSpace = tilesPerRow * margin * 2;
	const size = Math.floor( ( width - marginSpace ) / tilesPerRow );
	let remainderSize = size;
	let tileSize = remainderSize;
	const remainder = tileCount % tilesPerRow;
	let remainderSpace = 0;

	if ( remainder > 0 ) {
		remainderSpace = remainder * margin * 2;
		remainderSize = Math.floor( ( width - remainderSpace ) / remainder );
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
			row.width = width;
			row.groupSize = tileSize + 2 * margin;

			row = {
				tiles: [],
			};
		}
	}

	if ( row.tiles.length > 0 ) {
		row.height = tileSize + margin * 2;
		row.width = width;
		row.groupSize = tileSize + 2 * margin;

		rows.push( row );
	}

	return rows;
};

// @TODO
const rectangularLayout = options => squareLayout( options );
const columnsLayout = options => squareLayout( options );

export const getLayout = ( { columns, tileCount, width, layout } ) => {
	const layoutOptions = {
		columns,
		margin: TILE_MARGIN,
		tileCount,
		width,
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

/**
 * Returns the active style from the given className.
 *
 * @param {Array} styles Block style variations.
 * @param {string} className  Class name
 *
 * @return {Object?} The active style.
 *
 * From https://github.com/WordPress/gutenberg/blob/077f6c4eb9ba061bc00d5f3ae956d4789a291fb5/packages/editor/src/components/block-styles/index.js#L21-L43
 */
function getActiveStyle( styles, className ) {
	for ( const style of new TokenList( className ).values() ) {
		if ( style.indexOf( 'is-style-' ) === -1 ) {
			continue;
		}

		const potentialStyleName = style.substring( 9 );
		const activeStyle = find( styles, { name: potentialStyleName } );
		if ( activeStyle ) {
			return activeStyle;
		}
	}

	return find( styles, 'isDefault' );
}

export const getActiveStyleName = className => {
	const activeStyle = getActiveStyle( LAYOUT_STYLES, className );
	return activeStyle.name;
};
