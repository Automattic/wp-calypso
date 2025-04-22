import { Provider } from 'react-redux';
import { createStore } from 'redux';
import QrCodeLoginButton from '../qr-code';
import { WooWrapper, AkismetWrapper, AuthFormSocial } from './shared';
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
	title: 'client/components/Social Button/QR Code',
	component: QrCodeLoginButton,
	decorators: [ ( Story ) => <Provider store={ store }>{ Story() }</Provider> ],
};
export default meta;

type Story = StoryObj< typeof QrCodeLoginButton >;

export const Default: Story = {
	decorators: [ AuthFormSocial ],
};

export const Akismet: Story = {
	decorators: [ AuthFormSocial, AkismetWrapper ],
};

export const Woo: Story = {
	decorators: [ AuthFormSocial, WooWrapper ],
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
