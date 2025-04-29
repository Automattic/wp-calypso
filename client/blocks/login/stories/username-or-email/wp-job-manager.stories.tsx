import LoginUsername from '../../login-username';
import {
	LoginFormWrapper,
	LoginFormUserData,
	WPJobManagerWrapper,
	type SubmitButtonStory,
	usernameArgs,
} from '../shared';
import type { Meta } from '@storybook/react';
import '../../../../login/wp-login/style.scss';

const meta: Meta = {
	title: 'client/blocks/Login/Username or Email/WP Job Manager',
	decorators: [ LoginFormUserData, LoginFormWrapper, WPJobManagerWrapper ],
	component: LoginUsername,
	args: { ...usernameArgs },
};

export default meta;

export const Default: SubmitButtonStory = {};
