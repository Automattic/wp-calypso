import formatNumber, { DEFAULT_LOCALE } from './lib/format-number';

// TODO: Replace with formatNumber export. This function is a noop wrapper.
export default function formattedNumber( number: number | null ) {
	return formatNumber( number, DEFAULT_LOCALE, {} );
}
