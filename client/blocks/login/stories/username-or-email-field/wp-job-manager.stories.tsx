import LoginUsername from '../../login-username';
import {
	LoginFormWrapper,
	LoginFormUserData,
	WPJobManagerWrapper,
	type Story,
	loginUsernameArgs,
} from '../shared';
import type { Meta } from '@storybook/react';
import '../../../../login/wp-login/style.scss';

const meta: Meta = {
	title: 'client/blocks/Login/Username or Email/WP Job Manager',
	decorators: [ LoginFormUserData, LoginFormWrapper, WPJobManagerWrapper ],
	component: LoginUsername,
	args: { ...loginUsernameArgs },
};

export default meta;

export const Default: Story = {};
