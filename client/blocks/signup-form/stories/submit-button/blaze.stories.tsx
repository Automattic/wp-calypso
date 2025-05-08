import SignupSubmitButton from '../../signup-submit-button';
import {
	submitButtonArgs,
	SignupFormWrapper,
	type SubmitButtonStory,
	BlazeWrapper,
} from '../shared';
import type { Meta } from '@storybook/react';
import '../../../../layout/masterbar/blaze-pro.scss';

const meta: Meta = {
	title: 'client/blocks/Signup/Submit Button/Brands',
	decorators: [ SignupFormWrapper, BlazeWrapper ],
	component: SignupSubmitButton,
	args: { ...submitButtonArgs, children: 'Create your account' },
};

export default meta;

export const BlazePro: SubmitButtonStory = {};
