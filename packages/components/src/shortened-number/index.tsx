export type ShortenedNumberProps = {
	value: number | null;
};

const LOCALE = ( typeof window === 'undefined' ? null : window.navigator?.language ) ?? 'en-US';
const FORMATTER = new Intl.NumberFormat( LOCALE, {
	notation: 'compact',
	compactDisplay: 'short',
	maximumFractionDigits: 1,
} );

function formatNumber( value: number | null ) {
	return Number.isFinite( value ) ? FORMATTER.format( value as number ) : '-';
}

export default function ShortenedNumber( { value }: ShortenedNumberProps ) {
	return (
		<span
			className="shortened-number"
			title={ Number.isFinite( value ) ? String( value ) : undefined }
		>
			{ formatNumber( value ) }
		</span>
	);
}
