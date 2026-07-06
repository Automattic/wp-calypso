import './text-skeleton.scss';

/**
 * A loading skeleton that mirrors the dashboard's TextBlur/TextSkeleton approach: blurred filler
 * characters sized to the expected content, kept out of the accessibility tree.
 */
export default function TextSkeleton( { length = 6 }: { length?: number } ) {
	return (
		<span className="woopayments-text-skeleton" aria-hidden="true">
			{ 'X'.repeat( length ) }
		</span>
	);
}
