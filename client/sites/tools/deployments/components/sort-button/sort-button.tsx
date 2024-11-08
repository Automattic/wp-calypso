import { Button } from '@automattic/components';
import { chevronDown, chevronUp, Icon } from '@wordpress/icons';
import { ReactNode } from 'react';
import { SortDirection } from './use-sort';

import './style.scss';

interface SortButtonProps {
	activeValue: string;
	value: string;
	direction: SortDirection;
	onChange( value: string ): void;
	children: ReactNode;
}

export const SortButton = ( {
	activeValue,
	value,
	direction,
	children,
	onChange,
}: SortButtonProps ) => {
	const isActive = activeValue === value;
	const icon = direction === 'asc' ? chevronDown : chevronUp;

	const handleClick = () => {
		onChange( value );
	};

	return (
		<Button plain onClick={ handleClick } className="github-deployments-sort-button">
			{ children }
			<Icon
				icon={ icon }
				size={ 16 }
				css={ { verticalAlign: 'middle', visibility: isActive ? 'visible' : 'hidden' } }
			/>
		</Button>
	);
};
