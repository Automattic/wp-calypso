import { Button } from '@wordpress/components';
import type { FC, ReactNode } from 'react';

interface Props {
	variant: 'primary' | 'secondary';
	onClick: () => void;
	children: ReactNode;
}

export const StepButton: FC< Props > = ( { variant, onClick, children } ) => {
	return (
		<Button
			className="checklist-item__checklist-expanded-cta"
			variant={ variant }
			onClick={ onClick }
		>
			{ children }
		</Button>
	);
};
