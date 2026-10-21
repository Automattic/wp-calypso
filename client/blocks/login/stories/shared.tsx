import LoginSubmitButton from '../login-submit-button';
import type { StoryObj } from '@storybook/react';
import type { ComponentType } from 'react';
import './style.scss';

export const submitButtonArgs = {
	isWoo: false,
	isSendingEmail: false,
	isDisabled: false,
	buttonText: 'Continue',
};

export const LoginFormWrapper = ( Story: ComponentType ) => (
	<div className="login" style={ { maxWidth: '360px', padding: '30px' } }>
		<div className="login__form">
			<Story />
		</div>
	</div>
);

export const LoginFormAction = ( Story: ComponentType ) => (
	<div className="login__form-action">
		<Story />
	</div>
);

export const A4AWrapper = ( Story: ComponentType ) => (
	<div className="a8c-for-agencies">
		<Story />
	</div>
);

export const AkismetWrapper = ( Story: ComponentType ) => (
	<div className="is-akismet">
		<Story />
	</div>
);

export const BlazeWrapper = ( Story: ComponentType ) => (
	<div className="blaze-pro">
		<Story />
	</div>
);

export const CrowdsignalWrapper = ( Story: ComponentType ) => (
	<div className="crowdsignal">
		<Story />
	</div>
);

export const WooWrapper = ( Story: ComponentType ) => (
	<div className="woo is-woo-passwordless is-woo-com-oauth">
		<Story />
	</div>
);

export const JetpackCloudWrapper = ( Story: ComponentType ) => (
	<div className="jetpack-cloud">
		<Story />
	</div>
);

export const JetpackLoginWrapper = ( Story: ComponentType ) => (
	<div className="layout is-jetpack-login">
		<div className="login is-jetpack" style={ { maxWidth: '360px', padding: '30px' } }>
			<div className="login__form">
				<Story />
			</div>
		</div>
	</div>
);

export const GravatarWrapper = ( Story: ComponentType ) => (
	<div className="layout is-section-login is-grav-powered-client">
		<div className="login" style={ { maxWidth: '360px' } }>
			<Story />
		</div>
	</div>
);

export const WPJobManagerWrapper = ( Story: ComponentType ) => (
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
