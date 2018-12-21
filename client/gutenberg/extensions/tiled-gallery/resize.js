/**
 * Internal dependencies
 */

const MARGIN = 4;

const memo = new WeakMap();

export function handleRowResize( row, galleryWidth ) {
	// @TODO this width is passed already from the `view`;
	// we'll need to pass it down from the `edit` as well and then
	// remove this line.
	galleryWidth = galleryWidth || row.scrollWidth;

	applyRowRatio( row, getRowRatio( row ), galleryWidth );
}

function getRowRatio( row ) {
	if ( memo.has( row ) ) {
		return memo.get( row );
	}
	const result = getRowCols( row )
		.map( getColumnRatio )
		.reduce(
			( [ ratioA, weightedRatioA ], [ ratioB, weightedRatioB ] ) => {
				return [ ratioA + ratioB, weightedRatioA + weightedRatioB ];
			},
			[ 0, 0 ]
		);
	memo.set( row, result );
	return result;
}

function getRowCols( row ) {
	return Array.from( row.querySelectorAll( '.tiled-gallery__col' ) );
}

function getColImgs( col ) {
	return Array.from( col.querySelectorAll( '.tiled-gallery__item > img' ) );
}

function getColumnRatio( col ) {
	if ( memo.has( col ) ) {
		return memo.get( col );
	}
	const imgs = getColImgs( col );
	const imgCount = imgs.length;
	const ratio =
		1 /
		imgs.map( getImageRatio ).reduce( ( partialColRatio, imgRatio ) => {
			return partialColRatio + 1 / imgRatio;
		}, 0 );
	const result = [ ratio, ratio * imgCount || 1 ];
	memo.set( col, result );
	return result;
}

function getImageRatio( img ) {
	if ( memo.has( img ) ) {
		return memo.get( img );
	}
	const w = parseInt( img.dataset.width, 10 );
	const h = parseInt( img.dataset.height, 10 );
	const result = w && ! Number.isNaN( w ) && h && ! Number.isNaN( h ) ? w / h : 1;
	memo.set( img, result );
	return result;
}

function applyRowRatio( row, [ ratio, weightedRatio ], width ) {
	const rawHeight =
		( 1 / ratio ) *
		( width - MARGIN * row.children.length * ( row.children.length - weightedRatio ) );
	const height = Math.round( rawHeight );

	row.setAttribute( 'style', `height:${ height }px;` );

	applyColRatio( row, { height, rawHeight } );
}

function applyColRatio( row, { height, rawHeight } ) {
	getRowCols( row ).forEach( col => {
		/* Calculate and set column width */
		const width = Math.round(
			( rawHeight - MARGIN * col.children.length ) * getColumnRatio( col )[ 0 ]
		);
		col.setAttribute( 'style', `height:${ height }px;width:${ width }px;` );
	} );
}
