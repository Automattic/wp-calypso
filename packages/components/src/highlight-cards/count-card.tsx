import BaseCard from './base-card';

interface CountCardProps {
	heading: React.ReactNode;
	icon: React.ReactNode;
	value: number | string;
}

export default function CountCard( { heading, icon, value }: CountCardProps ) {
	const displayValue = typeof value === 'string' ? value : '-';

	return (
		<BaseCard
			heading={
				<>
					<div className="highlight-card-icon">{ icon }</div>
					<div className="highlight-card-title">{ heading }</div>
				</>
			}
		>
			<div className="highlight-card-count">
				<span className="highlight-card-count-value">{ displayValue }</span>
			</div>
		</BaseCard>
	);
}
