import { Checklist, ChecklistItem } from '@automattic/launchpad';
import React, { FC } from 'react';
import { useSteps } from './use-steps';

interface Props {
	fromUrl: string;
	onComplete: () => void;
}

export const Steps: FC< Props > = ( { fromUrl, onComplete } ) => {
	const checklistItems = useSteps( { fromUrl, onComplete } );

	return (
		<Checklist>
			{ checklistItems.map( ( props ) => (
				<ChecklistItem key={ props.task.id } { ...props } />
			) ) }
		</Checklist>
	);
};
