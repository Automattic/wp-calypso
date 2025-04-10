import { Provider } from 'react-redux';
import { createStore } from 'redux';
import UsernameOrEmailButton from '../username-or-email';
import { DefaultWrapper } from './shared';
import type { Meta, StoryObj } from '@storybook/react';

// Create minimal state with just what's needed
const initialState = {
	login: {
		isFormDisabled: false,
	},
};

const store = createStore( () => initialState );

const meta: Meta< typeof UsernameOrEmailButton > = {
	title: 'client/components/Social Button/Username or Email',
	component: UsernameOrEmailButton,
	args: {
		onClick: () => {},
	},
	decorators: [ ( Story ) => <Provider store={ store }>{ Story() }</Provider> ],
};
export default meta;

type Story = StoryObj< typeof UsernameOrEmailButton >;

export const Default: Story = {
	decorators: [ DefaultWrapper ],
};
