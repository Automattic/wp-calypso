import { GoogleSocialButton } from '../google';
import {
	AkismetWrapper,
	BlazeWrapper,
	GravatarWrapper,
	JetpackWrapper,
	WooWrapper,
	WPJobManagerWrapper,
	A4AWrapper,
	AuthFormSocial,
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
