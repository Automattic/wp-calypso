import { useHonestFooterCopy } from './copy';

/** Elapsed line, overrun notice, and the “why the wait” note shared by every honest variant. */
export default function HonestFooter( {
	elapsed,
	isOverrun,
}: {
	elapsed: number;
	isOverrun: boolean;
} ) {
	const footer = useHonestFooterCopy();
	return (
		<>
			<p className="marketplace-honest-progress__meta">{ footer.elapsed( elapsed ) }</p>
			{ isOverrun && (
				<p className="marketplace-honest-progress__overrun" role="status">
					{ footer.overrun }
				</p>
			) }
			<p className="marketplace-honest-progress__education">{ footer.education }</p>
		</>
	);
}
