import { Provider } from 'react-redux';
import { createStore } from 'redux';
import MagicLoginButton from '../magic-login';
import { DefaultWrapper, WooWrapper } from './shared';
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
	args: {
		loginUrl: 'https://example.com/magic-login',
	},
	decorators: [ ( Story ) => <Provider store={ store }>{ Story() }</Provider> ],
};
export default meta;

type Story = StoryObj< typeof MagicLoginButton >;

export const Default: Story = {
	decorators: [ DefaultWrapper ],
};

export const Woo: Story = {
	decorators: [ WooWrapper ],
};
