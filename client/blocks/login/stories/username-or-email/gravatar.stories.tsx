import LoginUsername from '../../login-username';
import {
	LoginFormWrapper,
	LoginFormUserData,
	GravatarWrapper,
	type SubmitButtonStory,
	usernameArgs,
} from '../shared';
import type { Meta } from '@storybook/react';
import '../../../../login/wp-login/style.scss';

const meta: Meta = {
	title: 'client/blocks/Login/Username or Email/Gravatar',
	decorators: [ LoginFormUserData, LoginFormWrapper, GravatarWrapper ],
	component: LoginUsername,
	args: { ...usernameArgs },
};

export default meta;

export const Default: SubmitButtonStory = {};
