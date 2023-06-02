import formatNumber from './lib/format-number';

export type ShortenedNumberProps = {
	value: number | null;
};

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
