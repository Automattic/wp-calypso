import { Provider } from 'react-redux';
import { createStore } from 'redux';
import QrCodeLoginButton from '../qr-code';
import { SocialButtonWrapper, WooWrapper, GravatarWrapper, JetpackWrapper } from './shared';
import type { Meta, StoryObj } from '@storybook/react';

const initialState = {
	login: {
		isFormDisabled: false,
	},
	oauth2Clients: {
		ui: {
			currentClientId: null,
		},
	},
	language: {
		locale: 'en',
	},
};

const store = createStore( () => initialState );

const meta: Meta< typeof QrCodeLoginButton > = {
	title: 'client/components/Social Buttons/QR Code',
	component: QrCodeLoginButton,
	args: {
		loginUrl: 'https://example.com/login',
	},
	decorators: [ ( Story ) => <Provider store={ store }>{ Story() }</Provider> ],
};
export default meta;

type Story = StoryObj< typeof QrCodeLoginButton >;

export const Default: Story = {
	decorators: [ SocialButtonWrapper ],
};

export const Woo: Story = {
	decorators: [ WooWrapper ],
	parameters: {
		state: {
			...initialState,
			oauth2Clients: {
				ui: {
					currentClientId: 'woo',
				},
			},
			sites: {
				isWoo: true,
			},
		},
	},
};

export const Jetpack: Story = {
	decorators: [ JetpackWrapper ],
};

export const Gravatar: Story = {
	decorators: [ GravatarWrapper ],
};
