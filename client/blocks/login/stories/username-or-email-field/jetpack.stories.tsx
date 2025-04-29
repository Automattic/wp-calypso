import LoginUsername from '../../login-username';
import {
	JetpackWrapper,
	LoginFormUserData,
	LoginFormWrapper,
	loginUsernameArgs,
	type LoginUsernameStory,
} from '../shared';
import type { Meta } from '@storybook/react';
import '../../../../layout/masterbar/oauth-client.scss';

const meta: Meta = {
	title: 'client/blocks/Login/Username or Email/Jetpack Cloud',
	decorators: [ LoginFormUserData, LoginFormWrapper, JetpackWrapper ],
	component: LoginUsername,
	args: { ...loginUsernameArgs },
};

export default meta;

export const Default: LoginUsernameStory = {};
