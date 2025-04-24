import LoginButton from '../../login-button';
import { loginButtonArgs, LoginFormAction, GravatarWrapper, type Story } from '../shared';
import type { Meta } from '@storybook/react';
import '../../../../login/wp-login/style.scss';

const meta: Meta = {
	title: 'client/blocks/Login/Login Button/Gravatar',
	decorators: [ LoginFormAction, GravatarWrapper ],
	component: LoginButton,
	args: loginButtonArgs,
};

export default meta;

export const Default: Story = {};
