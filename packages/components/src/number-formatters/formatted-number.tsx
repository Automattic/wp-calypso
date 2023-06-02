import formatNumber, { DEFAULT_LOCALE } from './lib/format-number';

export default function formattedNumber( number: number | null ) {
	return formatNumber( number, DEFAULT_LOCALE, {} );
}
