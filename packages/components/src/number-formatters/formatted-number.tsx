const FORMATTER = new Intl.NumberFormat();
export default function formattedNumber( number: number | null ) {
	return Number.isFinite( number ) ? FORMATTER.format( number as number ) : '-';
}
