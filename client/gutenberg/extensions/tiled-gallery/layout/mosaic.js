/**
 * External dependencies
 */
import { every, isEqual, some, sum, takeRight, zipWith } from 'lodash';

/**
 * Internal dependencies
 */
import Row from './row';
import Column from './column';

export default function Mosaic( { images, renderedImages } ) {
	const ratios = images.map( ( { height, width } ) => ( height && width ? width / height : 1 ) );
	const rows = ratiosToRows( ratios );

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

function ratiosToRows( ratios ) {
	// This function will recursively process the input until it is consumed
	const go = ( processed, toProcess ) => {
		if ( ! toProcess.length ) {
			return processed;
		}

		let next;

		if ( false ) {
			// Reverse_Symmetric_Row
		} else if ( false ) {
			// Long_Symmetric_Row
		} else if ( false ) {
			// Symmetric_Row
		} else if (
			checkNextRatios( [ isPortrait, isLandscape, isLandscape, isLandscape ] )( toProcess ) &&
			! some( takeRight( processed, 3 ), shape => isEqual( shape, [ 1, 3 ] ) )
		) {
			// One_Three
			next = [ 1, 3 ];
		} else if (
			checkNextRatios( [ isLandscape, isLandscape, isLandscape, isPortrait ] )( toProcess ) &&
			! some( takeRight( processed, 3 ), shape => isEqual( shape, [ 3, 1 ] ) )
		) {
			// Three_One
			next = [ 3, 1 ];
		} else if (
			checkNextRatios( [
				lt( 1.6 ),
				every( gte( 0.9 ), lt( 2 ) ),
				every( gte( 0.9 ), lt( 2 ) ),
			] ) &&
			! some( takeRight( processed, 3 ), shape => isEqual( shape, [ 1, 2 ] ) )
		) {
			// One_Two
			next = [ 1, 2 ];
		} else if ( false ) {
			// Five
			next = [ 1, 1, 1, 1, 1 ];
		} else if ( false ) {
			// Four
			next = [ 1, 1, 1, 1 ];
		} else if ( false ) {
			// Three
			next = [ 1, 1, 1 ];
		} else if ( false ) {
			// Two_One
			next = [ 2, 1 ];
		} else if ( checkNextRatios( [ isPanoramic ] )( toProcess ) ) {
			// Panoramic
			next = [ 1 ];
		} else if ( toProcess.length > 3 ) {
			// One_One
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
