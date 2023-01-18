import { Card } from '@automattic/components';

function HighlightCardSimple( { heading, icon, value } ) {
	// typeof myVar === 'string'
	const displayValue = typeof value === 'string' ? value : '-';
	return (
		<Card className="highlight-card">
			<div className="highlight-card-icon">{ icon }</div>
			<div className="highlight-card-heading">{ heading }</div>
			<div className="highlight-card-count">{ displayValue }</div>
		</Card>
	);
}

export default HighlightCardSimple;
