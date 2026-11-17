import { Meta, StoryObj } from '@storybook/react';
import { StepName } from '../types';
import Progress from './progress';
import type { ProgressStepList } from '../types';
import './progress.stories.scss';

const meta: Meta< typeof Progress > = {
	title: 'client/dashboard/domains/domain-connection-setup/Progress',
	component: Progress,
	tags: [ 'autodocs' ],
	parameters: {
		actions: { argTypesRegex: '^on.*' },
	},
};

export default meta;

type Story = StoryObj< typeof Progress >;

const suggestedSetupSteps: ProgressStepList = {
	[ StepName.SUGGESTED_START ]: 'Start setup',
	[ StepName.SUGGESTED_LOGIN ]: 'Log in to provider',
	[ StepName.SUGGESTED_UPDATE ]: 'Update name servers',
	[ StepName.SUGGESTED_VERIFYING ]: 'Verifying',
	[ StepName.SUGGESTED_CONNECTED ]: 'Connected',
};

export const SuggestedSetupFirstStep: Story = {
	args: {
		steps: suggestedSetupSteps,
		currentStepName: StepName.SUGGESTED_START,
	},
};

export const SuggestedSetupSecondStep: Story = {
	args: {
		steps: suggestedSetupSteps,
		currentStepName: StepName.SUGGESTED_LOGIN,
	},
};

export const EmptySteps: Story = {
	args: {
		steps: {},
		currentStepName: StepName.SUGGESTED_START,
	},
};
