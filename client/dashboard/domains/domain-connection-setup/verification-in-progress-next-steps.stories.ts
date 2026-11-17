import { Meta, StoryObj } from '@storybook/react';
import VerificationInProgressNextSteps from './verification-in-progress-next-steps';

const meta: Meta< typeof VerificationInProgressNextSteps > = {
	title: 'client/dashboard/Domains/VerificationInProgressNextSteps',
	component: VerificationInProgressNextSteps,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof VerificationInProgressNextSteps >;

export const Default: Story = {};

export const DensityLow: Story = {
	args: {
		density: 'low',
	},
};

export const DensityMedium: Story = {
	args: {
		density: 'medium',
	},
};

export const DensityHigh: Story = {
	args: {
		density: 'high',
	},
};
