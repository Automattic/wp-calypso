import './style.scss';

export function TextBlur( { children }: { children: React.ReactNode } ) {
	return (
		<span className="dashboard-text-blur" aria-hidden="true">
			{ children }
		</span>
	);
}
