import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { AppleLoginButton } from '../apple';
import { GitHubLoginButton } from '../github';
import { GoogleSocialButton } from '../google';
import { MagicLoginButton } from '../magic-login';
import { QrCodeLoginButton } from '../qr-code';
import { UsernameOrEmailButton } from '../username-or-email';
import type { StoryFn, StoryObj } from '@storybook/react';
import './style.scss';

export const AuthFormSocial = ( Story: StoryFn ) => (
	<div className="auth-form__social" style={ { maxWidth: '300px', padding: '30px' } }>
		<div className="auth-form__social-buttons">
			<div className="auth-form__social-buttons-container">
				<Story />
			</div>
		</div>
	</div>
);

export const A4AWrapper = ( Story: StoryFn ) => (
	<div className="a8c-for-agencies">
		<Story />
	</div>
);

export const AkismetWrapper = ( Story: StoryFn ) => (
	<div className="is-akismet">
		<Story />
	</div>
);

export const BlazeWrapper = ( Story: StoryFn ) => (
	<div className="blaze-pro">
		<Story />
	</div>
);

export const WooWrapper = ( Story: StoryFn ) => (
	<div className="woo is-woo-passwordless">
		<Story />
	</div>
);

export const JetpackWrapper = ( Story: StoryFn ) => (
	<div className="jetpack-cloud">
		<Story />
	</div>
);

export const GravatarWrapper = ( Story: StoryFn ) => (
	<div className="layout is-section-login is-grav-powered-client">
		<div className="login">
			<Story />
		</div>
	</div>
);

export const WPJobManagerWrapper = ( Story: StoryFn ) => (
	<div className="layout is-section-login is-grav-powered-client is-wp-job-manager">
		<div className="login">
			<Story />
		</div>
	</div>
);

// Reusable Story Configurations

export const appleStory: StoryObj< typeof AppleLoginButton > = {
	render: ( args ) => <AppleLoginButton { ...args } />,
	args: {
		translate: () => 'Continue with Apple',
	},
};

const gitHubInitialState = {
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

const gitHubStore = createStore( () => gitHubInitialState );

export const gitHubStory: StoryObj< typeof GitHubLoginButton > = {
	render: ( args ) => <GitHubLoginButton { ...args } />,
	args: {
		responseHandler: () => {},
		isLogin: true,
	},
	decorators: [
		( Story: StoryFn ) => (
			<Provider store={ gitHubStore }>
				<Story />
			</Provider>
		),
	],
};

export const googleStory: StoryObj< typeof GoogleSocialButton > = {
	render: ( args ) => <GoogleSocialButton { ...args } />,
	args: {
		translate: () => 'Continue with Google',
	},
};

const magicLoginInitialState = {
	login: {
		isFormDisabled: false,
	},
};

const magicLoginStore = createStore( () => magicLoginInitialState );

export const magicLoginStory: StoryObj< typeof MagicLoginButton > = {
	render: ( args ) => <MagicLoginButton { ...args } />,
	args: {
		loginUrl: 'https://example.com/login',
	},
	decorators: [
		( Story ) => (
			<Provider store={ magicLoginStore }>
				<Story />
			</Provider>
		),
	],
};

const qrCodeInitialState = {
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

const qrCodeStore = createStore( () => qrCodeInitialState );

export const qrCodeStory: StoryObj< typeof QrCodeLoginButton > = {
	render: ( args ) => <QrCodeLoginButton { ...args } />,
	args: {
		loginUrl: 'https://example.com/login',
	},
	decorators: [
		( Story: StoryFn ) => (
			<Provider store={ qrCodeStore }>
				<Story />
			</Provider>
		),
	],
};

const usernameOrEmailInitialState = {
	login: {
		isFormDisabled: false,
	},
};

const usernameOrEmailStore = createStore( () => usernameOrEmailInitialState );

export const usernameOrEmailStory: StoryObj< typeof UsernameOrEmailButton > = {
	render: ( args ) => <UsernameOrEmailButton { ...args } />,
	args: {
		onClick: () => {},
	},
	decorators: [
		( Story: StoryFn ) => (
			<Provider store={ usernameOrEmailStore }>
				<Story />
			</Provider>
		),
	],
};
