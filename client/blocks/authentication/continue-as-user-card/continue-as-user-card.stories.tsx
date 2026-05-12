import ContinueAsUserCard from './index';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof ContinueAsUserCard > = {
	title: 'client/blocks/authentication/ContinueAsUserCard',
	component: ContinueAsUserCard,
	tags: [ 'autodocs' ],
	parameters: {
		actions: { argTypesRegex: '^on.*' },
	},
};

export default meta;

type Story = StoryObj< typeof ContinueAsUserCard >;

const defaultArgs = {
	avatarUrl: 'https://gravatar.com/avatar/0?d=mp&s=96',
	name: 'Jane Doe',
	email: 'jane@example.com',
	continueLabel: 'Continue as Jane Doe',
	switchAccountLabel: 'Log in with another account',
};

export const Default: Story = {
	args: defaultArgs,
};

export const LongName: Story = {
	args: {
		...defaultArgs,
		name: 'Maximilian Alexander von Hohenzollern-Sigmaringen',
		continueLabel: 'Continue as Maximilian',
	},
};
