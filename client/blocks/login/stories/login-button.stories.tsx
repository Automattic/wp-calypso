import LoginButton from '../login-button';
import {
	WooWrapper,
	// 	GravatarWrapper,
	// 	JetpackWrapper,
	// 	BlazeWrapper,
	// 	AkismetWrapper,
	// 	WPJobManagerWrapper,
	// 	A4AWrapper,
	LoginForm,
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
	decorators: [ LoginForm ],
};

// export const A4A: Story = {
// 	decorators: [ AuthFormSocial, A4AWrapper ],
// };

// export const Akismet: Story = {
// 	decorators: [ AuthFormSocial, AkismetWrapper ],
// };

// export const Blaze: Story = {
// 	decorators: [ AuthFormSocial, BlazeWrapper ],
// };

// export const Gravatar: Story = {
// 	decorators: [ AuthFormSocial, GravatarWrapper ],
// };

// export const Jetpack: Story = {
// 	decorators: [ AuthFormSocial, JetpackWrapper ],
// };

export const Woo: Story = {
	args: {
		isWoo: true,
	},
	decorators: [ LoginForm, WooWrapper ],
};

// export const WPJobManager: Story = {
// 	decorators: [ AuthFormSocial, WPJobManagerWrapper ],
// };
