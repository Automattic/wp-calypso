import { AppleLoginButton } from '../apple';
import { SocialButtonWrapper, WooWrapper, GravatarWrapper } from './shared';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof AppleLoginButton > = {
	title: 'client/components/Social Buttons/Apple',
	component: AppleLoginButton,
	args: {
		responseHandler: () => {},
		translate: () => 'Continue with Apple',
	},
};
export default meta;

type Story = StoryObj< typeof AppleLoginButton >;

export const Default: Story = {
	decorators: [ SocialButtonWrapper ],
};

export const Woo: Story = {
	decorators: [ WooWrapper ],
};

export const Gravatar: Story = {
	decorators: [ GravatarWrapper ],
};
