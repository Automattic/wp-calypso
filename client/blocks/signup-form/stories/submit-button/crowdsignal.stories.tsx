import SignupSubmitButton from '../../signup-submit-button';
import {
	submitButtonArgs,
	SignupFormWrapper,
	type SubmitButtonStory,
	CrowdsignalWrapper,
} from '../shared';
import type { Meta } from '@storybook/react';
import '../../../../layout/masterbar/crowdsignal.scss';
import '../../../../blocks/signup-form/crowdsignal.scss';

const meta: Meta = {
	title: 'client/blocks/Signup/Submit Button',
	decorators: [ SignupFormWrapper, CrowdsignalWrapper ],
	component: SignupSubmitButton,
	args: {
		...submitButtonArgs,
		className: 'signup-form__crowdsignal-submit',
		children: 'Create a WordPress.com Account',
	},
};

export default meta;

export const Crowdsignal: SubmitButtonStory = {};
