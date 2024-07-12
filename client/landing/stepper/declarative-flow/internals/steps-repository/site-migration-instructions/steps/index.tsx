import { Checklist, ChecklistItem } from '@automattic/launchpad';
import React, { FC } from 'react';
import { useSteps } from './use-steps';

interface Props {
	fromUrl: string;
}

export const Steps: FC< Props > = ( { fromUrl } ) => {
	const checklistItems = useSteps( { fromUrl } );

	return (
		<Checklist>
			{ checklistItems.map( ( props ) => (
				<ChecklistItem key={ props.task.id } { ...props } />
			) ) }
		</Checklist>
	);
};
