import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { GitHubLoginButton } from '../github';
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
