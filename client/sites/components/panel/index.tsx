import './style.scss';

export function PanelSection( {
	title,
	subtitle,
	children,
}: {
	title: string;
	subtitle?: string | React.ReactNode;
	children: React.ReactNode;
} ) {
	return (
		<div className="panel-section">
			<h2>{ title }</h2>
			{ subtitle && <p className="subtitle">{ subtitle }</p> }
			{ children }
		</div>
	);
}
