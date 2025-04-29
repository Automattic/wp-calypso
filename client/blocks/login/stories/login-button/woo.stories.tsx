import LoginButton from '../../login-button';
import {
	LoginFormAction,
	LoginFormWrapper,
	type Story,
	WooWrapper,
	loginButtonArgs,
	sendingEmailStory,
} from './shared';
import type { Meta } from '@storybook/react';
import '../../../../layout/masterbar/woo.scss';

const meta: Meta = {
	title: 'client/blocks/Login/Login Button/Woo',
	decorators: [ LoginFormAction, LoginFormWrapper, WooWrapper ],
	component: LoginButton,
	args: { ...loginButtonArgs, isWoo: true },
};

export default meta;

export const Default: Story = {};

export const SendingEmail: Story = { ...sendingEmailStory };
