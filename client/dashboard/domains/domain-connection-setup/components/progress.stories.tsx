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

const advancedSetupSteps: ProgressStepList = {
	[ StepName.ADVANCED_START ]: 'Start setup',
	[ StepName.ADVANCED_LOGIN ]: 'Log in to provider',
	[ StepName.ADVANCED_UPDATE ]: 'Update A records',
	[ StepName.ADVANCED_VERIFYING ]: 'Verifying',
	[ StepName.ADVANCED_CONNECTED ]: 'Connected',
};

const domainConnectSteps: ProgressStepList = {
	[ StepName.DC_START ]: 'Domain Connect setup',
	[ StepName.DC_RETURN ]: 'Complete setup',
};

const subdomainSteps: ProgressStepList = {
	[ StepName.SUBDOMAIN_SUGGESTED_START ]: 'Start setup',
	[ StepName.SUBDOMAIN_SUGGESTED_LOGIN ]: 'Log in to provider',
	[ StepName.SUBDOMAIN_SUGGESTED_UPDATE ]: 'Update NS records',
	[ StepName.SUBDOMAIN_SUGGESTED_VERIFYING ]: 'Verifying',
	[ StepName.SUBDOMAIN_SUGGESTED_CONNECTED ]: 'Connected',
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

export const SuggestedSetupMiddleStep: Story = {
	args: {
		steps: suggestedSetupSteps,
		currentStepName: StepName.SUGGESTED_UPDATE,
	},
};

export const SuggestedSetupVerifying: Story = {
	args: {
		steps: suggestedSetupSteps,
		currentStepName: StepName.SUGGESTED_VERIFYING,
	},
};

export const SuggestedSetupCompleted: Story = {
	args: {
		steps: suggestedSetupSteps,
		currentStepName: StepName.SUGGESTED_CONNECTED,
	},
};

export const AdvancedSetupFirstStep: Story = {
	args: {
		steps: advancedSetupSteps,
		currentStepName: StepName.ADVANCED_START,
	},
};

export const AdvancedSetupMiddleStep: Story = {
	args: {
		steps: advancedSetupSteps,
		currentStepName: StepName.ADVANCED_UPDATE,
	},
};

export const AdvancedSetupCompleted: Story = {
	args: {
		steps: advancedSetupSteps,
		currentStepName: StepName.ADVANCED_CONNECTED,
	},
};

export const DomainConnectSetup: Story = {
	args: {
		steps: domainConnectSteps,
		currentStepName: StepName.DC_START,
	},
};

export const DomainConnectComplete: Story = {
	args: {
		steps: domainConnectSteps,
		currentStepName: StepName.DC_RETURN,
	},
};

export const SubdomainSetupFirstStep: Story = {
	args: {
		steps: subdomainSteps,
		currentStepName: StepName.SUBDOMAIN_SUGGESTED_START,
	},
};

export const SubdomainSetupMiddleStep: Story = {
	args: {
		steps: subdomainSteps,
		currentStepName: StepName.SUBDOMAIN_SUGGESTED_UPDATE,
	},
};

export const SubdomainSetupCompleted: Story = {
	args: {
		steps: subdomainSteps,
		currentStepName: StepName.SUBDOMAIN_SUGGESTED_CONNECTED,
	},
};

export const TwoStepProgress: Story = {
	args: {
		steps: {
			[ StepName.SUGGESTED_START ]: 'First step',
			[ StepName.SUGGESTED_CONNECTED ]: 'Second step',
		},
		currentStepName: StepName.SUGGESTED_START,
	},
};

export const EmptySteps: Story = {
	args: {
		steps: {},
		currentStepName: StepName.SUGGESTED_START,
	},
};
