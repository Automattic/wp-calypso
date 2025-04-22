import LoginButton from '../login-button';
import {
	WooWrapper,
	GravatarWrapper,
	JetpackWrapper,
	BlazeWrapper,
	AkismetWrapper,
	WPJobManagerWrapper,
	A4AWrapper,
	LoginFormAction,
	LoginFormWrapper,
} from './shared';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof LoginButton > = {
	title: 'client/blocks/Login/Login Button',
	component: LoginButton,
	args: {
		isWoo: false,
		isSendingEmail: false,
		isDisabled: false,
		buttonText: 'Continue',
	},
};
export default meta;

type Story = StoryObj< typeof LoginButton >;

export const Default: Story = {
	decorators: [ LoginFormAction, LoginFormWrapper ],
};

export const A4A: Story = {
	decorators: [ LoginFormAction, LoginFormWrapper, A4AWrapper ],
};

export const Akismet: Story = {
	decorators: [ LoginFormAction, AkismetWrapper ],
};

export const Blaze: Story = {
	decorators: [ LoginFormAction, LoginFormWrapper, BlazeWrapper ],
};

export const Gravatar: Story = {
	decorators: [ LoginFormAction, GravatarWrapper ],
};

export const Jetpack: Story = {
	decorators: [ LoginFormAction, LoginFormWrapper, JetpackWrapper ],
};

export const Woo: Story = {
	args: {
		isWoo: true,
	},
	decorators: [ LoginFormAction, LoginFormWrapper, WooWrapper ],
};

export const WPJobManager: Story = {
	decorators: [ LoginFormAction, WPJobManagerWrapper ],
};
