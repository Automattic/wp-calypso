import { Checklist, ChecklistItem } from '@automattic/launchpad';
import React, { FC } from 'react';
import type { Steps as StepsType } from './use-steps';

interface Props {
	steps: StepsType;
}

export const Steps: FC< Props > = ( { steps } ) => {
	return (
		<Checklist>
			{ steps.map( ( step ) => (
				<ChecklistItem key={ step.task.id } { ...step } />
			) ) }
		</Checklist>
	);
};
