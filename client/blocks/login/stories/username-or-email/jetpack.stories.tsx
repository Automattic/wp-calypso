import LoginUsername from '../../login-username';
import {
	JetpackWrapper,
	LoginFormUserData,
	LoginFormWrapper,
	usernameArgs,
	type UsernameStory,
} from '../shared';
import type { Meta } from '@storybook/react';
import '../../../../layout/masterbar/oauth-client.scss';

const meta: Meta = {
	title: 'client/blocks/Login/Username or Email/Jetpack Cloud',
	decorators: [ LoginFormUserData, LoginFormWrapper, JetpackWrapper ],
	component: LoginUsername,
	args: { ...usernameArgs },
};

export default meta;

export const Default: UsernameStory = {};
