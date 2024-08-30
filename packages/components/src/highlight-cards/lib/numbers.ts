import importedFormatNumber, {
	DEFAULT_LOCALE,
	STANDARD_FORMATTING_OPTIONS,
	COMPACT_FORMATTING_OPTIONS,
} from '../../number-formatters/lib/format-number';

export function formatNumber( number: number | null, isShortened = true, showSign = false ) {
	const option = isShortened
		? { ...COMPACT_FORMATTING_OPTIONS }
		: { ...STANDARD_FORMATTING_OPTIONS };
	if ( showSign ) {
		option.signDisplay = 'exceptZero';
	}
	return importedFormatNumber( number, DEFAULT_LOCALE, option );
}

export function subtract( a: number | null, b: number | null | undefined ): number | null {
	return a === null || b === null || b === undefined ? null : a - b;
}

export function percentCalculator( part: number | null, whole: number | null | undefined ) {
	if ( part === null || whole === null || whole === undefined ) {
		return null;
	}
	// Handle NaN case.
	if ( part === 0 && whole === 0 ) {
		return 0;
	}
	const answer = ( part / whole ) * 100;
	// Handle Infinities.
	return Math.abs( answer ) === Infinity ? 100 : Math.round( answer );
}
