import SignupSubmitButton from '../../signup-submit-button';
import { submitButtonArgs, type SubmitButtonStory, CrowdsignalWrapper } from '../shared';
import type { Meta } from '@storybook/react';
import '../../../../layout/masterbar/crowdsignal.scss';
import '../../crowdsignal.scss';

const meta: Meta = {
	title: 'client/blocks/Signup/Submit Button/Brands',
	decorators: [ CrowdsignalWrapper ],
	component: SignupSubmitButton,
	args: {
		...submitButtonArgs,
		className: 'signup-form__crowdsignal-submit',
		children: 'Create a WordPress.com Account',
	},
};

export default meta;

export const Crowdsignal: SubmitButtonStory = {};
