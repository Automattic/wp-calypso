import { Button } from '@wordpress/components';
import { FC, ReactNode } from 'react';

interface StepButtonProps {
	variant?: 'primary' | 'secondary';
	onClick: () => void;
	disabled?: boolean;
	children: ReactNode;
}

export const StepButton: FC< StepButtonProps > = ( {
	variant = 'primary',
	onClick,
	disabled = false,
	children,
} ) => {
	return (
		<Button variant={ variant } onClick={ onClick } disabled={ disabled }>
			{ children }
		</Button>
	);
};
