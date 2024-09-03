import importedFormatNumber, {
	DEFAULT_LOCALE,
	STANDARD_FORMATTING_OPTIONS,
	COMPACT_FORMATTING_OPTIONS,
	PERCENTAGE_FORMATTING_OPTIONS,
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

export function formatPercentage(
	number: number | null,
	usePreciseSmallPercentages: boolean = false
) {
	// If the number is < 1%, then use 2 significant digits and maximumFractionDigits of 2.
	// Otherwise, use the default percentage formatting options.
	const option =
		usePreciseSmallPercentages && number && number < 0.01
			? { ...PERCENTAGE_FORMATTING_OPTIONS, maximumFractionDigits: 2, maximumSignificantDigits: 2 }
			: PERCENTAGE_FORMATTING_OPTIONS;
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
	const answer = part / whole;
	// Handle Infinities as 100%.
	return ! Number.isFinite( answer ) ? 1 : answer;
}
