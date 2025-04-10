import { GoogleSocialButton } from '../google';
import {
	DefaultWrapper,
	WooWrapper,
	GravatarWrapper,
	JetpackWrapper,
	BlazeWrapper,
} from './shared';
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
	decorators: [ DefaultWrapper ],
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
