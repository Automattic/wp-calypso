import { Button } from '@wordpress/components';
import type { FC } from 'react';

interface Props {
	onClick: () => void;
	text: string;
}

export const StepPrimaryCta: FC< Props > = ( { onClick, text } ) => {
	return (
		<Button
			className="checklist-item__checklist-expanded-cta"
			variant="primary"
			onClick={ onClick }
		>
			{ text }
		</Button>
	);
};
