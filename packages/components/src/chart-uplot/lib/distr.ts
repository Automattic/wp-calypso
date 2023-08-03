function roundDec( val, dec ) {
	return Math.round( val * ( dec = 10 ** dec ) ) / dec;
}

const SPACE_BETWEEN = 1;
const SPACE_AROUND = 2;
const SPACE_EVENLY = 3;

const coord = ( i, offs, iwid, gap ) => roundDec( offs + i * ( iwid + gap ), 6 );

export default function distr( numItems, sizeFactor, justify, onlyIdx, each ) {
	const space = 1 - sizeFactor;

	let gap =
		justify == SPACE_BETWEEN
			? space / ( numItems - 1 )
			: justify == SPACE_AROUND
			? space / numItems
			: justify == SPACE_EVENLY
			? space / ( numItems + 1 )
			: 0;

	if ( isNaN( gap ) || gap == Infinity ) {
		gap = 0;
	}

	const offs =
		justify == SPACE_BETWEEN
			? 0
			: justify == SPACE_AROUND
			? gap / 2
			: justify == SPACE_EVENLY
			? gap
			: 0;

	const iwid = sizeFactor / numItems;
	const _iwid = roundDec( iwid, 6 );

	if ( onlyIdx == null ) {
		for ( let i = 0; i < numItems; i++ ) {
			each( i, coord( i, offs, iwid, gap ), _iwid );
		}
	} else {
		each( onlyIdx, coord( onlyIdx, offs, iwid, gap ), _iwid );
	}
}
