/**
 * Internal dependencies
 */
import { GUTTER_WIDTH } from '../../constants';

/**
 * Distribute a difference across ns so that their sum matches the target
 *
 * @param {Array<number>}  parts  Array of numbers to fit
 * @param {number}         target Number that sum should match
 * @return {Array<number>}        Adjusted parts
 */
function adjustFit( parts, target ) {
	const diff = target - parts.reduce( ( sum, n ) => sum + n, 0 );
	const partialDiff = diff / parts.length;
	return parts.map( p => p + partialDiff );
}

export function handleRowResize( row, width ) {
	applyRowRatio( row, getRowRatio( row ), width );
}

function getRowRatio( row ) {
	const result = getRowCols( row )
		.map( getColumnRatio )
		.reduce(
			( [ ratioA, weightedRatioA ], [ ratioB, weightedRatioB ] ) => {
				return [ ratioA + ratioB, weightedRatioA + weightedRatioB ];
			},
			[ 0, 0 ]
		);
	return result;
}

export function getGalleryRows( gallery ) {
	return Array.from( gallery.querySelectorAll( '.tiled-gallery__row' ) );
}

function getRowCols( row ) {
	return Array.from( row.querySelectorAll( '.tiled-gallery__col' ) );
}

function getColImgs( col ) {
	return Array.from(
		col.querySelectorAll( '.tiled-gallery__item > img, .tiled-gallery__item > a > img' )
	);
}

function getColumnRatio( col ) {
	const imgs = getColImgs( col );
	const imgCount = imgs.length;
	const ratio =
		1 /
		imgs.map( getImageRatio ).reduce( ( partialColRatio, imgRatio ) => {
			return partialColRatio + 1 / imgRatio;
		}, 0 );
	const result = [ ratio, ratio * imgCount || 1 ];
	return result;
}

function getImageRatio( img ) {
	const w = parseInt( img.dataset.width, 10 );
	const h = parseInt( img.dataset.height, 10 );
	const result = w && ! Number.isNaN( w ) && h && ! Number.isNaN( h ) ? w / h : 1;
	return result;
}

function applyRowRatio( row, [ ratio, weightedRatio ], width ) {
	const rawHeight =
		( 1 / ratio ) * ( width - GUTTER_WIDTH * ( row.childElementCount - 1 ) - weightedRatio );

	applyColRatio( row, {
		rawHeight,
		rowWidth: width - GUTTER_WIDTH * ( row.childElementCount - 1 ),
	} );
}

function applyColRatio( row, { rawHeight, rowWidth } ) {
	const cols = getRowCols( row );

	const colWidths = cols.map(
		col => ( rawHeight - GUTTER_WIDTH * ( col.childElementCount - 1 ) ) * getColumnRatio( col )[ 0 ]
	);

	const adjustedWidths = adjustFit( colWidths, rowWidth );

	cols.forEach( ( col, i ) => {
		const rawWidth = colWidths[ i ];
		const width = adjustedWidths[ i ];
		applyImgRatio( col, {
			colHeight: rawHeight - GUTTER_WIDTH * ( col.childElementCount - 1 ),
			width,
			rawWidth,
		} );
	} );
}

function applyImgRatio( col, { colHeight, width, rawWidth } ) {
	const imgHeights = getColImgs( col ).map( img => rawWidth / getImageRatio( img ) );
	const adjustedHeights = adjustFit( imgHeights, colHeight );

	// Set size of col children, not the <img /> element
	Array.from( col.children ).forEach( ( item, i ) => {
		const height = adjustedHeights[ i ];
		item.setAttribute( 'style', `height:${ height }px;width:${ width }px;` );
	} );
}
