import { Provider } from 'react-redux';
import { createStore } from 'redux';
import MagicLoginButton from '../magic-login';
import { WooWrapper, AkismetWrapper, AuthFormSocial } from './shared';
import type { Meta, StoryObj } from '@storybook/react';

// Create minimal state with just what's needed
const initialState = {
	login: {
		isFormDisabled: false,
	},
};

const store = createStore( () => initialState );

const meta: Meta< typeof MagicLoginButton > = {
	title: 'client/components/Social Button/Magic Login',
	component: MagicLoginButton,
	decorators: [ ( Story ) => <Provider store={ store }>{ Story() }</Provider> ],
};
export default meta;

type Story = StoryObj< typeof MagicLoginButton >;

export const Default: Story = {
	decorators: [ AuthFormSocial ],
};

export const Akismet: Story = {
	decorators: [ AuthFormSocial, AkismetWrapper ],
};

export const Woo: Story = {
	decorators: [ AuthFormSocial, WooWrapper ],
};
