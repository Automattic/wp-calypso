import { Checklist, ChecklistItem } from '@automattic/launchpad';
import React, { FC } from 'react';
import { useSteps } from './use-steps';

interface Props {
	fromUrl: string;
	onComplete: () => void;
}

export const Steps: FC< Props > = ( { fromUrl, onComplete } ) => {
	const { steps } = useSteps( { fromUrl, onComplete } );

	return (
		<Checklist>
			{ steps.map( ( props ) => (
				<ChecklistItem key={ props.task.id } { ...props } />
			) ) }
		</Checklist>
	);
};
