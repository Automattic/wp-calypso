/**
 * External dependencies
 */
import { every, isEqual, overEvery, some, sum, take, takeRight, zipWith } from 'lodash';

/**
 * Internal dependencies
 */
import Row from './row';
import Column from './column';

export default function Mosaic( { images, isWide, renderedImages } ) {
	const ratios = images.map( ( { height, width } ) => ( height && width ? width / height : 1 ) );
	const rows = ratiosToRows( ratios, { isWide } );

	let cursor = 0;
	return rows.map( ( row, rowIndex ) => (
		<Row key={ rowIndex }>
			{ row.map( ( colSize, colIndex ) => {
				const columnImages = renderedImages.slice( cursor, cursor + colSize );
				cursor += colSize;
				return <Column key={ colIndex }>{ columnImages }</Column>;
			} ) }
		</Row>
	) );
}

// check for more to process
// figure out the next row
// split the remaining rows
// recurse

function ratiosToRows( ratios, { isWide } ) {
	// This function will recursively process the input until it is consumed
	const go = ( processed, toProcess ) => {
		if ( ! toProcess.length ) {
			return processed;
		}

		let next;

		if (
			/* Reverse_Symmetric_Row */
			toProcess.length > 15 &&
			checkNextRatios( [ isLandscape, isLandscape, isPortrait, isLandscape, isLandscape ] )(
				toProcess
			) &&
			isNotRecentShape( [ 2, 1, 2 ], 5 )( processed )
		) {
			next = [ 2, 1, 2 ];
		} else if (
			/* Long_Symmetric_Row */
			toProcess.length > 15 &&
			checkNextRatios( [
				isLandscape,
				isLandscape,
				isLandscape,
				isPortrait,
				isLandscape,
				isLandscape,
				isLandscape,
			] )( toProcess ) &&
			isNotRecentShape( [ 3, 1, 3 ], 5 )( processed )
		) {
			next = [ 3, 1, 3 ];
		} else if (
			/* Symmetric_Row */
			toProcess.length !== 5 &&
			checkNextRatios( [ isPortrait, isLandscape, isLandscape, isPortrait ] )( toProcess ) &&
			isNotRecentShape( [ 1, 2, 1 ], 5 )( processed )
		) {
			next = [ 1, 2, 1 ];
		} else if (
			/* One_Three */
			checkNextRatios( [ isPortrait, isLandscape, isLandscape, isLandscape ] )( toProcess ) &&
			isNotRecentShape( [ 1, 3 ], 3 )( processed )
		) {
			next = [ 1, 3 ];
		} else if (
			/* Three_One */
			checkNextRatios( [ isLandscape, isLandscape, isLandscape, isPortrait ] )( toProcess ) &&
			isNotRecentShape( [ 3, 1 ], 3 )( processed )
		) {
			next = [ 3, 1 ];
		} else if (
			/* One_Two */
			checkNextRatios( [
				lt( 1.6 ),
				overEvery( gte( 0.9 ), lt( 2 ) ),
				overEvery( gte( 0.9 ), lt( 2 ) ),
			] )( toProcess ) &&
			isNotRecentShape( [ 1, 2 ], 3 )( processed )
		) {
			next = [ 1, 2 ];
		} else if (
			/* Five */
			isWide &&
			( toProcess.length === 5 || ( toProcess.length !== 10 && toProcess.length > 6 ) ) &&
			isNotRecentShape( [ 1, 1, 1, 1, 1 ], 1 )( processed ) &&
			sum( take( toProcess, 5 ) ) < 5
		) {
			next = [ 1, 1, 1, 1, 1 ];
		} else if (
			/* Four */
			isNotRecentShape( [ 1, 1, 1, 1 ], 1 )( processed ) &&
			( function( ratio ) {
				return ( ratio < 3.5 && toProcess.length > 5 ) || ( ratio < 7 && toProcess.length === 4 );
			} )( sum( take( toProcess, 4 ) ) )
		) {
			next = [ 1, 1, 1, 1 ];
		} else if (
			/* Three */
			toProcess.length >= 3 &&
			! [ 4, 6 ].includes( toProcess.length ) &&
			isNotRecentShape( [ 1, 1, 1 ], 3 )( processed ) &&
			( function( ratio ) {
				return (
					ratio < 2.5 ||
					( ratio < 5 &&
						/* nextAreSymettric */
						( toProcess.length >= 3 &&
							/* @FIXME floating point equality?? */ toProcess[ 0 ] === toProcess[ 2 ] ) ) ||
					isWide
				);
			} )( sum( take( toProcess, 3 ) ) )
		) {
			next = [ 1, 1, 1 ];
		} else if (
			/* Two_One */
			checkNextRatios( [
				overEvery( gte( 0.9 ), lt( 2 ) ),
				overEvery( gte( 0.9 ), lt( 2 ) ),
				lt( 1.6 ),
			] )( toProcess ) &&
			isNotRecentShape( [ 1, 2 ], 3 )( processed )
		) {
			next = [ 2, 1 ];
		} else if ( /* Panoramic */ checkNextRatios( [ isPanoramic ] )( toProcess ) ) {
			next = [ 1 ];
		} else if ( /* One_One */ toProcess.length > 3 ) {
			next = [ 1, 1 ];
		} else {
			// Everything left
			next = Array( toProcess.length ).fill( 1 );
		}

		// Add row
		const nextProcessed = processed.concat( [ next ] );

		// Trim consumed images from next processing step
		const consumedImages = sum( next );
		const nextToProcess = toProcess.slice( consumedImages );

		return go( nextProcessed, nextToProcess );
	};
	return go( [], ratios );
}

function isNotRecentShape( shape, numRecents ) {
	return recents =>
		! some( takeRight( recents, numRecents ), recentShape => isEqual( recentShape, shape ) );
}

function checkNextRatios( shape ) {
	return ratios =>
		ratios.length >= shape.length &&
		every( zipWith( shape, ratios.slice( 0, shape.length ), ( f, r ) => f( r ) ) );
}

/* eslint-disable no-unused-vars */

function isAny() {
	return true;
}

function isLandscape( ratio ) {
	return ratio >= 1 && ratio < 2;
}

function isPortrait( ratio ) {
	return ratio < 1;
}

function isPanoramic( ratio ) {
	return ratio >= 2;
}

// >
function gt( n ) {
	return m => n < m;
}
// >=
function gte( n ) {
	return m => n <= m;
}
// <
function lt( n ) {
	return m => n > m;
}
// <=
function lte( n ) {
	return m => n >= m;
}
