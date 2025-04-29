import LoginUsername from '../../login-username';
import { LoginFormUserData, LoginFormWrapper, type UsernameStory, usernameArgs } from '../shared';
import type { Meta } from '@storybook/react';

const meta: Meta = {
	title: 'client/blocks/Login/Username or Email/Default',
	decorators: [ LoginFormUserData, LoginFormWrapper ],
	component: LoginUsername,
	args: { ...usernameArgs },
};

export default meta;

export const Default: UsernameStory = {};

export const Disabled: UsernameStory = {
	args: {
		isDisabled: true,
	},
};

export const Error: UsernameStory = {
	args: {
		isError: true,
	},
};
