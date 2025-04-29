import LoginUsername from '../../login-username';
import {
	LoginFormUserData,
	LoginFormWrapper,
	type LoginUsernameStory,
	loginUsernameArgs,
} from '../shared';
import type { Meta } from '@storybook/react';

const meta: Meta = {
	title: 'client/blocks/Login/Username or Email/Default',
	decorators: [ LoginFormUserData, LoginFormWrapper ],
	component: LoginUsername,
	args: { ...loginUsernameArgs },
};

export default meta;

export const Default: LoginUsernameStory = {};

export const Disabled: LoginUsernameStory = {
	args: {
		isDisabled: true,
	},
};

export const Error: LoginUsernameStory = {
	args: {
		isError: true,
	},
};
