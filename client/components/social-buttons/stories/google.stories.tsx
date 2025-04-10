import { GoogleSocialButton } from '../google';
import { SocialButtonWrapper, WooWrapper, GravatarWrapper } from './shared';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof GoogleSocialButton > = {
	title: 'client/components/Social Buttons/Google',
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

export const Gravatar: Story = {
	decorators: [ GravatarWrapper ],
};
