import LoginButton from '../../login-button';
import {
	disabledStory,
	sendingEmailStory,
	loginButtonArgs,
	LoginFormAction,
	LoginFormWrapper,
	type Story,
} from '../shared';
import type { Meta } from '@storybook/react';

const meta: Meta = {
	title: 'client/blocks/Login/Login Button/Default',
	decorators: [ LoginFormAction, LoginFormWrapper ],
	component: LoginButton,
	args: loginButtonArgs,
};

export default meta;

export const Default: Story = {};

export const Disabled: Story = { ...disabledStory };

export const SendingEmail: Story = { ...sendingEmailStory };
