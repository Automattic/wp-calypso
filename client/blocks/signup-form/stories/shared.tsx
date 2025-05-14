import SignupSubmitButton from '../signup-submit-button';
import type { StoryFn, StoryObj } from '@storybook/react';
import './style.scss';

export const submitButtonArgs = {
	isDisabled: false,
	isBusy: false,
	children: 'Continue',
};

export const SignupFormWrapper = ( Story: StoryFn ) => (
	<div className="signup-form" style={ { maxWidth: '360px', padding: '30px' } }>
		<div className="card logged-out-form__footer">
			<Story />
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

export const CrowdsignalWrapper = ( Story: StoryFn ) => (
	<div className="crowdsignal">
		<div className="signup-form__crowdsignal" style={ { maxWidth: '360px', padding: '30px' } }>
			<div className="card logged-out-form__footer">
				<Story />
			</div>
		</div>
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

export type SubmitButtonStory = StoryObj< typeof SignupSubmitButton >;
