import LoginUsername from '../../login-username';
import {
	AkismetWrapper,
	LoginFormUserData,
	loginUsernameArgs,
	type LoginUsernameStory,
} from '../shared';
import type { Meta } from '@storybook/react';

const meta: Meta = {
	title: 'client/blocks/Login/Username or Email/Akismet',
	decorators: [ LoginFormUserData, AkismetWrapper ],
	component: LoginUsername,
	args: { ...loginUsernameArgs },
};

export default meta;

export const Default: LoginUsernameStory = {};
