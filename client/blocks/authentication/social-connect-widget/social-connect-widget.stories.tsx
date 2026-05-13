import SocialConnectWidget from './index';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof SocialConnectWidget > = {
	title: 'client/blocks/authentication/SocialConnectWidget',
	component: SocialConnectWidget,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof SocialConnectWidget >;

export const Google: Story = {
	args: {
		service: 'google',
	},
};

export const Apple: Story = {
	args: {
		service: 'apple',
	},
};

export const GitHub: Story = {
	args: {
		service: 'github',
	},
};

export const PayPal: Story = {
	args: {
		service: 'paypal',
	},
};
