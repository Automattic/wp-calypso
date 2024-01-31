import type uPlot from 'uplot';

// Hide fractional values on the y-axis.
export const hideFractionNumber = ( self: uPlot, splits: number[] ) => {
	splits = splits.map( ( split ) => Math.floor( split ) );
	const newSplits = [ splits[ 0 ] ];
	for ( let i = 1; i < splits.length; i++ ) {
		if ( splits[ i ] === splits[ i - 1 ] ) {
			newSplits.push( null as unknown as number );
		} else {
			newSplits.push( splits[ i ] );
		}
	}
	return newSplits;
};
