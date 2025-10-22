import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { StepFindSSHDetails } from './step-find-ssh-details';
import type { Task, Expandable } from '@automattic/launchpad';

const FIND_SSH_DETAILS = 'find-ssh-details';
const ADD_SERVER_ADDRESS = 'add-server-address';
const SHARE_SSH_ACCESS = 'share-ssh-access';

interface StepData {
	key: string;
	title: string | React.ReactNode;
	content: JSX.Element;
}

type StepsData = StepData[];

interface Step {
	task: Task;
	expandable?: Expandable;
	onClick?: () => void;
}

export type Steps = Step[];

interface StepsObject {
	steps: Steps;
}

interface UseStepsOptions {
	host?: string;
	onNoSSHAccess?: () => void;
}

export const useSteps = ( options?: UseStepsOptions ): StepsObject => {
	const translate = useTranslate();
	const [ completedSteps, setCompletedSteps ] = useState< Set< string > >( new Set() );
	const { host, onNoSSHAccess } = options || {};

	const isComplete = ( stepKey: string ): boolean => {
		return completedSteps.has( stepKey );
	};

	const handleStepComplete = ( stepKey: string ) => {
		setCompletedSteps( ( prev ) => new Set( prev ).add( stepKey ) );
	};

	const stepsData: StepsData = [
		{
			key: FIND_SSH_DETAILS,
			title: translate( 'Find your SSH details' ),
			content: (
				<StepFindSSHDetails
					onSuccess={ () => handleStepComplete( FIND_SSH_DETAILS ) }
					onNoSSHAccess={ onNoSSHAccess }
					host={ host }
				/>
			),
		},
		{
			key: ADD_SERVER_ADDRESS,
			title: translate( 'Add SSH server address' ),
			content: <div>Add SSH server address</div>,
		},
		{
			key: SHARE_SSH_ACCESS,
			title: translate( 'Share SSH access' ),
			content: <div>Share SSH access</div>,
		},
	];

	const steps: Steps = stepsData.map( ( step, index ) => {
		// Render the content with the step-specific elements
		const contentNode = <>{ step.content }</>;
		return {
			task: {
				id: step.key,
				title: step.title,
				completed: isComplete( step.key ),
				disabled: false,
			},
			expandable: {
				content: contentNode,
				isOpen: index === 0,
			},
		};
	} );

	return {
		steps,
	};
};
