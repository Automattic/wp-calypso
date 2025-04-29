import LoginUsername from '../../login-username';
import {
	A4AWrapper,
	LoginFormUserData,
	LoginFormWrapper,
	type UsernameStory,
	usernameArgs,
} from '../shared';
import type { Meta } from '@storybook/react';

const meta: Meta = {
	title: 'client/blocks/Login/Username or Email/Automattic For Agencies',
	decorators: [ LoginFormUserData, LoginFormWrapper, A4AWrapper ],
	component: LoginUsername,
	args: { ...usernameArgs },
};

export default meta;

export const Default: UsernameStory = {};
