import LoginUsername from '../../login-username';
import {
	BlazeWrapper,
	LoginFormUserData,
	LoginFormWrapper,
	loginUsernameArgs,
	type LoginUsernameStory,
} from '../shared';
import type { Meta } from '@storybook/react';
import '../../../../layout/masterbar/blaze-pro.scss';

const meta: Meta = {
	title: 'client/blocks/Login/Username or Email/Blaze Pro',
	decorators: [ LoginFormUserData, LoginFormWrapper, BlazeWrapper ],
	component: LoginUsername,
	args: { ...loginUsernameArgs, label: 'Your email address' },
};

export default meta;

export const Default: LoginUsernameStory = {};
