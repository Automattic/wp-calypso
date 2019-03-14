/**
 * External dependencies
 */
import {
	drop,
	every,
	isEqual,
	map,
	overEvery,
	some,
	sum,
	take,
	takeRight,
	takeWhile,
	zipWith,
} from 'lodash';

export function imagesToRatios( images ) {
	return map( images, ratioFromImage );
}

export function ratioFromImage( { height, width } ) {
	return height && width ? width / height : 1;
}

/**
 * Build three columns, each of which should contain approximately 1/3 of the total ratio
 *
 * @param  {Array.<number>}         ratios      Ratios of images put into shape
 * @param  {number}                 columnCount Number of columns
 *
 * @return {Array.<Array.<number>>}             Shape of rows and columns
 */
export function ratiosToColumns( ratios, columnCount ) {
	// If we don't have more than 1 per column, just return a simple 1 ratio per column shape
	if ( ratios.length <= columnCount ) {
		return [ Array( ratios.length ).fill( 1 ) ];
	}

	const total = sum( ratios );
	const targetColRatio = total / columnCount;

	const row = [];
	let toProcess = ratios;
	let accumulatedRatio = 0;

	// We skip the last column in the loop and add rest later
	for ( let i = 0; i < columnCount - 1; i++ ) {
		const colSize = takeWhile( toProcess, ratio => {
			const shouldTake = accumulatedRatio <= ( i + 1 ) * targetColRatio;
			if ( shouldTake ) {
				accumulatedRatio += ratio;
			}
			return shouldTake;
		} ).length;
		row.push( colSize );
		toProcess = drop( toProcess, colSize );
	}

	// Don't calculate last column, just add what's left
	row.push( toProcess.length );

	// A shape is an array of rows. Wrap our row in an array.
	return [ row ];
}

/**
 * These are partially applied functions.
 * They rely on helper function (defined below) to create a function that expects to be passed ratios
 * during processing.
 *
 * …FitsNextImages() functions should be passed ratios to be processed
 * …IsNotRecent() functions should be passed the processed shapes
 */

const reverseSymmetricRowIsNotRecent = isNotRecentShape( [ 2, 1, 2 ], 5 );
const reverseSymmetricFitsNextImages = checkNextRatios( [
	isLandscape,
	isLandscape,
	isPortrait,
	isLandscape,
	isLandscape,
] );
const longSymmetricRowFitsNextImages = checkNextRatios( [
	isLandscape,
	isLandscape,
	isLandscape,
	isPortrait,
	isLandscape,
	isLandscape,
	isLandscape,
] );
const longSymmetricRowIsNotRecent = isNotRecentShape( [ 3, 1, 3 ], 5 );
const symmetricRowFitsNextImages = checkNextRatios( [
	isPortrait,
	isLandscape,
	isLandscape,
	isPortrait,
] );
const symmetricRowIsNotRecent = isNotRecentShape( [ 1, 2, 1 ], 5 );
const oneThreeFitsNextImages = checkNextRatios( [
	isPortrait,
	isLandscape,
	isLandscape,
	isLandscape,
] );
const oneThreeIsNotRecent = isNotRecentShape( [ 1, 3 ], 3 );
const threeOneIsFitsNextImages = checkNextRatios( [
	isLandscape,
	isLandscape,
	isLandscape,
	isPortrait,
] );
const threeOneIsNotRecent = isNotRecentShape( [ 3, 1 ], 3 );
const oneTwoFitsNextImages = checkNextRatios( [
	lt( 1.6 ),
	overEvery( gte( 0.9 ), lt( 2 ) ),
	overEvery( gte( 0.9 ), lt( 2 ) ),
] );
const oneTwoIsNotRecent = isNotRecentShape( [ 1, 2 ], 3 );
const fiveIsNotRecent = isNotRecentShape( [ 1, 1, 1, 1, 1 ], 1 );
const fourIsNotRecent = isNotRecentShape( [ 1, 1, 1, 1 ], 1 );
const threeIsNotRecent = isNotRecentShape( [ 1, 1, 1 ], 3 );
const twoOneFitsNextImages = checkNextRatios( [
	overEvery( gte( 0.9 ), lt( 2 ) ),
	overEvery( gte( 0.9 ), lt( 2 ) ),
	lt( 1.6 ),
] );
const twoOneIsNotRecent = isNotRecentShape( [ 2, 1 ], 3 );
const panoramicFitsNextImages = checkNextRatios( [ isPanoramic ] );

export function ratiosToMosaicRows( ratios, { isWide } = {} ) {
	// This function will recursively process the input until it is consumed
	const go = ( processed, toProcess ) => {
		if ( ! toProcess.length ) {
			return processed;
		}

		let next;

		if (
			/* Reverse_Symmetric_Row */
			toProcess.length > 15 &&
			reverseSymmetricFitsNextImages( toProcess ) &&
			reverseSymmetricRowIsNotRecent( processed )
		) {
			next = [ 2, 1, 2 ];
		} else if (
			/* Long_Symmetric_Row */
			toProcess.length > 15 &&
			longSymmetricRowFitsNextImages( toProcess ) &&
			longSymmetricRowIsNotRecent( processed )
		) {
			next = [ 3, 1, 3 ];
		} else if (
			/* Symmetric_Row */
			toProcess.length !== 5 &&
			symmetricRowFitsNextImages( toProcess ) &&
			symmetricRowIsNotRecent( processed )
		) {
			next = [ 1, 2, 1 ];
		} else if (
			/* One_Three */
			oneThreeFitsNextImages( toProcess ) &&
			oneThreeIsNotRecent( processed )
		) {
			next = [ 1, 3 ];
		} else if (
			/* Three_One */
			threeOneIsFitsNextImages( toProcess ) &&
			threeOneIsNotRecent( processed )
		) {
			next = [ 3, 1 ];
		} else if (
			/* One_Two */
			oneTwoFitsNextImages( toProcess ) &&
			oneTwoIsNotRecent( processed )
		) {
			next = [ 1, 2 ];
		} else if (
			/* Five */
			isWide &&
			( toProcess.length === 5 || ( toProcess.length !== 10 && toProcess.length > 6 ) ) &&
			fiveIsNotRecent( processed ) &&
			sum( take( toProcess, 5 ) ) < 5
		) {
			next = [ 1, 1, 1, 1, 1 ];
		} else if (
			/* Four */
			isFourValidCandidate( processed, toProcess )
		) {
			next = [ 1, 1, 1, 1 ];
		} else if (
			/* Three */
			isThreeValidCandidate( processed, toProcess, isWide )
		) {
			next = [ 1, 1, 1 ];
		} else if (
			/* Two_One */
			twoOneFitsNextImages( toProcess ) &&
			twoOneIsNotRecent( processed )
		) {
			next = [ 2, 1 ];
		} else if ( /* Panoramic */ panoramicFitsNextImages( toProcess ) ) {
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

function isThreeValidCandidate( processed, toProcess, isWide ) {
	const ratio = sum( take( toProcess, 3 ) );
	return (
		toProcess.length >= 3 &&
		toProcess.length !== 4 &&
		toProcess.length !== 6 &&
		threeIsNotRecent( processed ) &&
		( ratio < 2.5 ||
			( ratio < 5 &&
				/* nextAreSymettric */
				( toProcess.length >= 3 &&
					/* @FIXME floating point equality?? */ toProcess[ 0 ] === toProcess[ 2 ] ) ) ||
			isWide )
	);
}

function isFourValidCandidate( processed, toProcess ) {
	const ratio = sum( take( toProcess, 4 ) );
	return (
		( fourIsNotRecent( processed ) && ( ratio < 3.5 && toProcess.length > 5 ) ) ||
		( ratio < 7 && toProcess.length === 4 )
	);
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

function isLandscape( ratio ) {
	return ratio >= 1 && ratio < 2;
}

function isPortrait( ratio ) {
	return ratio < 1;
}

function isPanoramic( ratio ) {
	return ratio >= 2;
}

// >=
function gte( n ) {
	return m => m >= n;
}

// <
function lt( n ) {
	return m => m < n;
}
