import './style.scss';

export function TextBlur( {
	dummyCharacterCount,
	children,
}: {
	dummyCharacterCount?: number;
	children?: React.ReactNode;
} ) {
	const text = dummyCharacterCount ? 'X'.repeat( dummyCharacterCount ) : children;

	return (
		<span className="dashboard-text-blur" aria-hidden="true">
			{ text }
		</span>
	);
}
