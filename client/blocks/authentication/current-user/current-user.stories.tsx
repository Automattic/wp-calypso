import CurrentUser from './index';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof CurrentUser > = {
	title: 'client/blocks/authentication/CurrentUser',
	component: CurrentUser,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof CurrentUser >;

const defaultArgs = {
	avatarUrl: 'https://gravatar.com/avatar/0?d=mp&s=96',
	name: 'Jane Doe',
	email: 'jane@example.com',
};

export const Default: Story = {
	args: defaultArgs,
};

export const LongName: Story = {
	args: {
		...defaultArgs,
		name: 'Maximilian Alexander von Hohenzollern-Sigmaringen',
	},
};
