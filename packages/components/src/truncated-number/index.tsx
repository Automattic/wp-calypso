export type TruncatedNumberProps = {
	value: number | null;
};

const FORMATTER = new Intl.NumberFormat( navigator?.language || 'en-US', {
	notation: 'compact',
	compactDisplay: 'short',
	maximumFractionDigits: 1,
} );

function formatNumber( value: number | null ) {
	if ( ! Number.isFinite( value ) ) {
		return '-';
	}

	return Number.isFinite( value ) ? FORMATTER.format( value as number ) : '-';
}

export default function TruncatedNumber( { value }: TruncatedNumberProps ) {
	return (
		<span
			className="truncated-number"
			title={ Number.isFinite( value ) ? String( value ) : undefined }
		>
			{ formatNumber( value ) }
		</span>
	);
}
