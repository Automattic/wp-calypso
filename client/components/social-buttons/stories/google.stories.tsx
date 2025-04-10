import { GoogleSocialButton } from '../google';
import { SocialButtonWrapper, WooWrapper, GravatarWrapper, JetpackWrapper } from './shared';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof GoogleSocialButton > = {
	title: 'client/components/Social Button/Google',
	component: GoogleSocialButton,
	args: {
		responseHandler: () => {},
		translate: () => 'Continue with Google',
		recordTracksEvent: () => {},
	},
};
export default meta;

type Story = StoryObj< typeof GoogleSocialButton >;

export const Default: Story = {
	decorators: [ SocialButtonWrapper ],
};

export const Woo: Story = {
	decorators: [ WooWrapper ],
};

export const Jetpack: Story = {
	decorators: [ JetpackWrapper ],
};

export const Gravatar: Story = {
	decorators: [ GravatarWrapper ],
};
