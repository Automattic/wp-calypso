import { memoize } from 'lodash';

const warnOnce = memoize( console.warn ); // eslint-disable-line no-console

const DEFAULT_LOCALE =
	( typeof window === 'undefined' ? null : window.navigator?.language ) ?? 'en-US';

const DEFAULT_OPTIONS = {
	compactDisplay: 'short',
	maximumFractionDigits: 1,
	notation: 'compact',
} as Intl.NumberFormatOptions;

export function formatNumber(
	number: number | null,
	locale = DEFAULT_LOCALE,
	options = DEFAULT_OPTIONS
) {
	if ( number === null || ! Number.isFinite( number ) ) {
		return '-';
	}

	// Certain versions of Safari (14.1) on macOS Mojave (10.14) have encountered problems with specific parameters in formatOptions.
	// In the event of an error, problematic parameters are removed from the formatOptions object, and no formatting is applied as a fallback.
	// This approach ensures a smooth user experience by avoiding disruption for unaffected users.
	// Refer to https://github.com/Automattic/wp-calypso/issues/77635 for more details.
	try {
		new Intl.NumberFormat( locale, options ).format( number as number );
	} catch ( error: unknown ) {
		warnOnce(
			`formatted-number numberFormat error: Intl.NumberFormat().format( ${ typeof number } )`,
			error
		);
	}

	// Remove these key/values from formatOptions.
	const optionsToRemove: Record< string, string > = {
		currencyDisplay: 'narrow',
		currencySign: 'accounting',
		style: 'unit',
	};

	// Remove these keys from formatOptions irrespective of value.
	const optionNamesToRemove = [ 'signDisplay', 'compactDisplay' ];

	// Create new format options object with problematic parameters removed.
	const reducedFormatOptions: Record< string, string > = {};
	for ( const [ key, value ] of Object.entries( options ) ) {
		if ( optionsToRemove[ key ] && value === optionsToRemove[ key ] ) {
			continue;
		}
		if ( optionNamesToRemove.includes( key ) ) {
			continue;
		}
		reducedFormatOptions[ key ] = value;
	}

	try {
		return new Intl.NumberFormat( locale, reducedFormatOptions ).format( number );
	} catch {
		// If the reduced format option still throws an error, try without format options as a fallback.
		return new Intl.NumberFormat( locale ).format( number );
	}
}
