import LoginSubmitButton from '../login-submit-button';
import type { StoryFn, StoryObj } from '@storybook/react';
import './style.scss';

export const submitButtonArgs = {
	isWoo: false,
	isSendingEmail: false,
	isDisabled: false,
	buttonText: 'Continue',
};

export const LoginFormWrapper = ( Story: StoryFn ) => (
	<div className="login" style={ { maxWidth: '360px', padding: '30px' } }>
		<div className="login__form">
			<Story />
		</div>
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
		<div className="login is-akismet" style={ { maxWidth: '360px', padding: '30px' } }>
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

export const CrowdsignalWrapper = ( Story: StoryFn ) => (
	<div className="crowdsignal">
		<Story />
	</div>
);

export const WooWrapper = ( Story: StoryFn ) => (
	<div className="woo is-woo-passwordless is-woo-com-oauth">
		<Story />
	</div>
);

export const JetpackCloudWrapper = ( Story: StoryFn ) => (
	<div className="jetpack-cloud">
		<Story />
	</div>
);

export const JetpackLoginWrapper = ( Story: StoryFn ) => (
	<div className="layout is-jetpack-login">
		<div className="login is-jetpack" style={ { maxWidth: '360px', padding: '30px' } }>
			<div className="login__form">
				<Story />
			</div>
		</div>
	</div>
);

export const GravatarWrapper = ( Story: StoryFn ) => (
	<div className="layout is-section-login is-grav-powered-client">
		<div className="login" style={ { maxWidth: '360px' } }>
			<Story />
		</div>
	</div>
);

export const WPJobManagerWrapper = ( Story: StoryFn ) => (
	<div className="layout is-section-login is-grav-powered-client is-wp-job-manager">
		<div className="login" style={ { maxWidth: '360px' } }>
			<Story />
		</div>
	</div>
);

export type SubmitButtonStory = StoryObj< typeof LoginSubmitButton >;

export const sendingEmailStory: SubmitButtonStory = {
	args: {
		isSendingEmail: true,
	},
};
