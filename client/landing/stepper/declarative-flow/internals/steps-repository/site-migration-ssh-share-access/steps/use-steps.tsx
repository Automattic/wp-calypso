import { useTranslate } from 'i18n-calypso';
import { AccordionNotice } from '../components/accordion-notice';
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

const useStepsData = (): StepsData => {
	const translate = useTranslate();

	return [
		{
			key: FIND_SSH_DETAILS,
			title: translate( 'Find your SSH details' ),
			content: (
				<div>
					<AccordionNotice variant="error">
						<p>Find your SSH details</p>
					</AccordionNotice>
				</div>
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
};

export const useSteps = (): StepsObject => {
	const stepsData = useStepsData();

	const isComplete = ( stepKey: string ): boolean => {
		switch ( stepKey ) {
			default:
				return false;
		}
	};

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
