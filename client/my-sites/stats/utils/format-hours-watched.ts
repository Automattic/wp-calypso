import { formatNumber } from '@automattic/number-formatters';

// Hours watched is shown to one decimal, but a nonzero total under an hour
// rounds to "< 1.0" rather than "0.0" so a small-but-present value never reads
// as none.
export function formatHoursWatched( value: number ): string {
	if ( value === 0 || value >= 1 ) {
		return formatNumber( value, { decimals: 1 } );
	}
	return `< ${ formatNumber( 1, { decimals: 1 } ) }`;
}
