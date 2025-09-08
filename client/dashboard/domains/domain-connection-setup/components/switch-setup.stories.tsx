import { DomainConnectionSetupMode } from '@automattic/api-core';
import { Meta, StoryObj } from '@storybook/react';
import { StepType, StepName } from '../types';
import SwitchSetup from './switch-setup';

const meta: Meta< typeof SwitchSetup > = {
	title: 'client/dashboard/domains/domain-connection-setup/SwitchSetup',
	component: SwitchSetup,
	tags: [ 'autodocs' ],
	parameters: {
		actions: { argTypesRegex: '^on.*' },
	},
	argTypes: {
		setPage: { action: 'setPage' },
	},
};

export default meta;

type Story = StoryObj< typeof SwitchSetup >;

export const SuggestedModeWithDomainConnect: Story = {
	args: {
		currentStepType: StepType.UPDATE_NAME_SERVERS,
		currentMode: DomainConnectionSetupMode.SUGGESTED,
		supportsDomainConnect: true,
		isSubdomain: false,
		// eslint-disable-next-line no-console
		setPage: ( stepName: StepName ) => console.log( 'setPage called with:', stepName ),
	},
};

export const AdvancedModeWithDomainConnect: Story = {
	args: {
		currentStepType: StepType.UPDATE_A_RECORDS,
		currentMode: DomainConnectionSetupMode.ADVANCED,
		supportsDomainConnect: true,
		isSubdomain: false,
		// eslint-disable-next-line no-console
		setPage: ( stepName: StepName ) => console.log( 'setPage called with:', stepName ),
	},
};

export const DomainConnectMode: Story = {
	args: {
		currentStepType: StepType.LOG_IN_TO_PROVIDER,
		currentMode: DomainConnectionSetupMode.DC,
		supportsDomainConnect: true,
		isSubdomain: false,
		// eslint-disable-next-line no-console
		setPage: ( stepName: StepName ) => console.log( 'setPage called with:', stepName ),
	},
};

export const SuggestedModeWithoutDomainConnect: Story = {
	args: {
		currentStepType: StepType.UPDATE_NAME_SERVERS,
		currentMode: DomainConnectionSetupMode.SUGGESTED,
		supportsDomainConnect: false,
		isSubdomain: false,
		// eslint-disable-next-line no-console
		setPage: ( stepName: StepName ) => console.log( 'setPage called with:', stepName ),
	},
};

export const AdvancedModeWithoutDomainConnect: Story = {
	args: {
		currentStepType: StepType.UPDATE_A_RECORDS,
		currentMode: DomainConnectionSetupMode.ADVANCED,
		supportsDomainConnect: false,
		isSubdomain: false,
		// eslint-disable-next-line no-console
		setPage: ( stepName: StepName ) => console.log( 'setPage called with:', stepName ),
	},
};

export const SubdomainSuggestedMode: Story = {
	args: {
		currentStepType: StepType.UPDATE_NS_RECORDS,
		currentMode: DomainConnectionSetupMode.SUGGESTED,
		supportsDomainConnect: false,
		isSubdomain: true,
		// eslint-disable-next-line no-console
		setPage: ( stepName: StepName ) => console.log( 'setPage called with:', stepName ),
	},
};

export const SubdomainAdvancedMode: Story = {
	args: {
		currentStepType: StepType.UPDATE_CNAME_RECORDS,
		currentMode: DomainConnectionSetupMode.ADVANCED,
		supportsDomainConnect: false,
		isSubdomain: true,
		// eslint-disable-next-line no-console
		setPage: ( stepName: StepName ) => console.log( 'setPage called with:', stepName ),
	},
};

export const ConnectedState: Story = {
	args: {
		currentStepType: StepType.CONNECTED,
		currentMode: DomainConnectionSetupMode.SUGGESTED,
		supportsDomainConnect: true,
		isSubdomain: false,
		// eslint-disable-next-line no-console
		setPage: ( stepName: StepName ) => console.log( 'setPage called with:', stepName ),
	},
};

export const VerifyingState: Story = {
	args: {
		currentStepType: StepType.VERIFYING,
		currentMode: DomainConnectionSetupMode.ADVANCED,
		supportsDomainConnect: false,
		isSubdomain: false,
		// eslint-disable-next-line no-console
		setPage: ( stepName: StepName ) => console.log( 'setPage called with:', stepName ),
	},
};
