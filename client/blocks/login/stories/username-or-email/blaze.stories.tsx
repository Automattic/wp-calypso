import LoginUsername from '../../login-username';
import {
	BlazeWrapper,
	LoginFormUserData,
	LoginFormWrapper,
	usernameArgs,
	type UsernameStory,
} from '../shared';
import type { Meta } from '@storybook/react';
import '../../../../layout/masterbar/blaze-pro.scss';

const meta: Meta = {
	title: 'client/blocks/Login/Username or Email/Blaze Pro',
	decorators: [ LoginFormUserData, LoginFormWrapper, BlazeWrapper ],
	component: LoginUsername,
	args: { ...usernameArgs, label: 'Your email address' },
};

export default meta;

export const Default: UsernameStory = {};
