import { AppleLoginButton } from '../apple';
import {
	DefaultWrapper,
	WooWrapper,
	GravatarWrapper,
	JetpackWrapper,
	BlazeWrapper,
	AkismetWrapper,
	WPJobManagerWrapper,
	A4AWrapper,
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
	decorators: [ DefaultWrapper ],
};

export const A4A: Story = {
	decorators: [ A4AWrapper ],
};

export const Akismet: Story = {
	decorators: [ AkismetWrapper ],
};

export const Blaze: Story = {
	decorators: [ BlazeWrapper ],
};

export const Gravatar: Story = {
	decorators: [ GravatarWrapper ],
};

export const Jetpack: Story = {
	decorators: [ JetpackWrapper ],
};

export const Woo: Story = {
	decorators: [ WooWrapper ],
};

export const WPJobManager: Story = {
	decorators: [ WPJobManagerWrapper ],
};
