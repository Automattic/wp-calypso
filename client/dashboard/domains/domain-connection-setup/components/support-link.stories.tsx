import { DomainConnectionSetupMode } from '@automattic/api-core';
import { Meta, StoryObj } from '@storybook/react';
import SupportLink from './support-link';

const meta: Meta< typeof SupportLink > = {
	title: 'client/dashboard/domains/domain-connection-setup/SupportLink',
	component: SupportLink,
	tags: [ 'autodocs' ],
	parameters: {
		actions: { argTypesRegex: '^on.*' },
	},
};

export default meta;

type Story = StoryObj< typeof SupportLink >;

export const SuggestedMode: Story = {
	args: {
		mode: DomainConnectionSetupMode.SUGGESTED,
	},
};

export const AdvancedMode: Story = {
	args: {
		mode: DomainConnectionSetupMode.ADVANCED,
	},
};

export const DoneMode: Story = {
	args: {
		mode: DomainConnectionSetupMode.DONE,
	},
};

export const DomainConnectMode: Story = {
	args: {
		mode: DomainConnectionSetupMode.DC,
	},
};

export const OwnershipVerificationMode: Story = {
	args: {
		mode: DomainConnectionSetupMode.OWNERSHIP_VERIFICATION,
	},
};

export const TransferMode: Story = {
	args: {
		mode: DomainConnectionSetupMode.TRANSFER,
	},
};
