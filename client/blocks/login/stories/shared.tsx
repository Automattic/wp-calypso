import LoginButton from '../login-button';
import type { StoryFn, StoryObj } from '@storybook/react';
import './style.scss';

export const loginButtonArgs = {
	isWoo: false,
	isSendingEmail: false,
	isDisabled: false,
	buttonText: 'Continue',
};

export const LoginFormWrapper = ( Story: StoryFn ) => (
	<div className="login" style={ { maxWidth: '300px', padding: '30px' } }>
		<Story />
	</div>
);

export const LoginFormAction = ( Story: StoryFn ) => (
	<div className="login__form-action">
		<Story />
	</div>
);

export const A4AWrapper = ( Story: StoryFn ) => (
	<div className="a8c-for-agencies">
		<Story />
	</div>
);

export const AkismetWrapper = ( Story: StoryFn ) => (
	<div className="layout is-white-login">
		<div className="login is-akismet" style={ { maxWidth: '300px', padding: '30px' } }>
			<div className="login__form">
				<Story />
			</div>
		</div>
	</div>
);

export const BlazeWrapper = ( Story: StoryFn ) => (
	<div className="blaze-pro">
		<Story />
	</div>
);

export const WooWrapper = ( Story: StoryFn ) => (
	<div className="woo is-woo-passwordless is-woo-com-oauth">
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
		<div className="login" style={ { maxWidth: '300px' } }>
			<Story />
		</div>
	</div>
);

export const WPJobManagerWrapper = ( Story: StoryFn ) => (
	<div className="layout is-section-login is-grav-powered-client is-wp-job-manager">
		<div className="login" style={ { maxWidth: '300px' } }>
			<Story />
		</div>
	</div>
);

export type Story = StoryObj< typeof LoginButton >;

export const disabledStory: Story = {
	args: {
		isDisabled: true,
	},
};

export const sendingEmailStory: Story = {
	args: {
		isSendingEmail: true,
	},
};
