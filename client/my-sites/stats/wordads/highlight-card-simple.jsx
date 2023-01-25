import { Card } from '@automattic/components';

function HighlightCardSimple( { heading, icon, value } ) {
	const displayValue = typeof value === 'string' ? value : '-';
	return (
		<Card className="highlight-card">
			<div className="highlight-card-icon">{ icon }</div>
			<div className="highlight-card-heading">{ heading }</div>
			<div className="highlight-card-count">
				<span className="highlight-card-count-value">{ displayValue }</span>
			</div>
		</Card>
	);
}

export default HighlightCardSimple;
