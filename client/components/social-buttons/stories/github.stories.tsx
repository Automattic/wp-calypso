import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { GitHubLoginButton } from '../github';
import { DefaultWrapper, WooWrapper, GravatarWrapper, JetpackWrapper } from './shared';
import type { Meta, StoryObj } from '@storybook/react';

const initialState = {
	currentUser: { id: 1 },
	ui: {
		route: {
			path: {
				currentRoute: '/log-in',
			},
		},
	},
	language: {
		locale: 'en',
	},
	login: {
		isFormDisabled: false,
		requestError: null,
		requestSuccess: false,
		magicLogin: {
			isFetching: false,
			isComplete: false,
		},
	},
};

const store = createStore( () => initialState );

const meta: Meta< typeof GitHubLoginButton > = {
	title: 'client/components/Social Button/GitHub',
	component: GitHubLoginButton,
	args: {
		responseHandler: () => {},
		isLogin: true,
	},
	decorators: [ ( Story ) => <Provider store={ store }>{ Story() }</Provider> ],
};
export default meta;

type Story = StoryObj< typeof GitHubLoginButton >;

export const Default: Story = {
	decorators: [ DefaultWrapper ],
};

export const Woo: Story = {
	decorators: [ WooWrapper ],
};

export const Jetpack: Story = {
	decorators: [ JetpackWrapper ],
};

export const Gravatar: Story = {
	decorators: [ GravatarWrapper ],
};
