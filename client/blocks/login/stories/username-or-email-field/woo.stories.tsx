import LoginUsername from '../../login-username';
import {
	LoginFormUserData,
	LoginFormWrapper,
	WooWrapper,
	loginUsernameArgs,
	type LoginUsernameStory,
} from '../shared';
import type { Meta } from '@storybook/react';
import '../../../../layout/masterbar/woo.scss';
const meta: Meta = {
	title: 'client/blocks/Login/Username or Email/Woo',
	decorators: [ LoginFormUserData, LoginFormWrapper, WooWrapper ],
	component: LoginUsername,
	args: { ...loginUsernameArgs },
};

export default meta;

export const Default: LoginUsernameStory = {};
