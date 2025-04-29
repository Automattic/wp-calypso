import LoginButton from '../../login-button';
import { AkismetWrapper, loginButtonArgs, LoginFormAction, type Story } from './shared';
import type { Meta } from '@storybook/react';

const meta: Meta = {
	title: 'client/blocks/Login/Login Button/Akismet',
	decorators: [ LoginFormAction, AkismetWrapper ],
	component: LoginButton,
	args: loginButtonArgs,
};

export default meta;

export const Default: Story = {};
