import LoginUsername from '../../login-username';
import {
	LoginFormUserData,
	LoginFormWrapper,
	WooWrapper,
	usernameArgs,
	type UsernameStory,
} from '../shared';
import type { Meta } from '@storybook/react';
import '../../../../layout/masterbar/woo.scss';
const meta: Meta = {
	title: 'client/blocks/Login/Username or Email/Woo',
	decorators: [ LoginFormUserData, LoginFormWrapper, WooWrapper ],
	component: LoginUsername,
	args: { ...usernameArgs },
};

export default meta;

export const Default: UsernameStory = {};
