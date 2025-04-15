import { AppleLoginButton } from '../apple';
import {
	WooWrapper,
	GravatarWrapper,
	JetpackWrapper,
	BlazeWrapper,
	AkismetWrapper,
	WPJobManagerWrapper,
	A4AWrapper,
	AuthFormSocial,
} from './shared';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof AppleLoginButton > = {
	title: 'client/components/Social Button/Apple',
	component: AppleLoginButton,
	args: {
		responseHandler: () => {},
		translate: () => 'Continue with Apple',
		redirectUri: 'https://example.com',
	},
};
export default meta;

type Story = StoryObj< typeof AppleLoginButton >;

export const Default: Story = {
	decorators: [ AuthFormSocial ],
};

export const A4A: Story = {
	decorators: [ AuthFormSocial, A4AWrapper ],
};

export const Akismet: Story = {
	decorators: [ AuthFormSocial, AkismetWrapper ],
};

export const Blaze: Story = {
	decorators: [ AuthFormSocial, BlazeWrapper ],
};

export const Gravatar: Story = {
	decorators: [ AuthFormSocial, GravatarWrapper ],
};

export const Jetpack: Story = {
	decorators: [ AuthFormSocial, JetpackWrapper ],
};

export const Woo: Story = {
	decorators: [ AuthFormSocial, WooWrapper ],
};

export const WPJobManager: Story = {
	decorators: [ AuthFormSocial, WPJobManagerWrapper ],
};
