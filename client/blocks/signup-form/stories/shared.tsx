import SignupSubmitButton from '../signup-submit-button';
import type { StoryObj } from '@storybook/react';
import type { ComponentType } from 'react';
import './style.scss';

export const submitButtonArgs = {
	isDisabled: false,
	isBusy: false,
	children: 'Continue',
};

export const SignupFormWrapper = ( Story: ComponentType ) => (
	<div className="signup-form" style={ { maxWidth: '360px', padding: '30px' } }>
		<div className="card logged-out-form__footer">
			<Story />
		</div>
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

export const JetpackWrapper = ( Story: ComponentType ) => (
	<div className="jetpack-cloud">
		<Story />
	</div>
);

export type SubmitButtonStory = StoryObj< typeof SignupSubmitButton >;
