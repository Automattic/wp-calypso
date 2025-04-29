import LoginUsername from '../../login-username';
import {
	A4AWrapper,
	LoginFormUserData,
	LoginFormWrapper,
	type LoginUsernameStory,
	loginUsernameArgs,
} from '../shared';
import type { Meta } from '@storybook/react';

const meta: Meta = {
	title: 'client/blocks/Login/Username or Email/Automattic For Agencies',
	decorators: [ LoginFormUserData, LoginFormWrapper, A4AWrapper ],
	component: LoginUsername,
	args: { ...loginUsernameArgs },
};

export default meta;

export const Default: LoginUsernameStory = {};
