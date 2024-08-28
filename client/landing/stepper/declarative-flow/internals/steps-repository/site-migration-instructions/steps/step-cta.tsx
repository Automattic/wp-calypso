import { Button } from '@wordpress/components';
import type { FC } from 'react';

interface Props {
	onClick: () => void;
	text: string;
	variant: 'primary' | 'secondary';
}

export const StepCta: FC< Props > = ( { onClick, text, variant } ) => {
	return (
		<Button
			className="checklist-item__checklist-expanded-cta"
			variant={ variant }
			onClick={ onClick }
		>
			{ text }
		</Button>
	);
};
