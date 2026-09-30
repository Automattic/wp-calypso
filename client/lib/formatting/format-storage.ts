import { formatNumber } from '@automattic/number-formatters';

const STORAGE_UNITS = [ 'B', 'KB', 'MB', 'GB', 'TB', 'PB' ];

/**
 * Mirrors WordPress core's `size_format()` so storage figures match wp-admin and the Dashboard.
 */
export function formatStorage( bytes: number ): string {
	let value = Math.max( bytes, 0 );
	let unitIndex = 0;
	while ( value >= 1024 && unitIndex < STORAGE_UNITS.length - 1 ) {
		value /= 1024;
		unitIndex++;
	}
	const number = formatNumber( value, { numberFormatOptions: { maximumFractionDigits: 1 } } );
	return `${ number } ${ STORAGE_UNITS[ unitIndex ] }`;
}
