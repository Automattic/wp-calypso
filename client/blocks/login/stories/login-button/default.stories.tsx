import LoginButton from '../../login-button';
import {
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
	args: { ...loginButtonArgs },
};

export default meta;

export const Default: Story = {};

export const Disabled: Story = {
	args: {
		isDisabled: true,
	},
};

export const SendingEmail: Story = { ...sendingEmailStory };
