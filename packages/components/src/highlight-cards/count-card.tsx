import { Icon } from '@wordpress/icons';
import { useMemo } from 'react';
import BaseCard from './base-card';

interface CountCardProps {
	heading: React.ReactNode;
	icon: JSX.Element;
	value: number | string;
}

function useDisplayValue( value: CountCardProps[ 'value' ] ) {
	return useMemo( () => {
		if ( typeof value === 'string' ) {
			return value;
		}
		if ( typeof value === 'number' ) {
			return value.toLocaleString();
		}
		return '-';
	}, [ value ] );
}

export default function CountCard( { heading, icon, value }: CountCardProps ) {
	const displayValue = useDisplayValue( value );

	return (
		<BaseCard
			heading={
				<>
					<div className="highlight-card-icon">
						<Icon icon={ icon } />
					</div>
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
