import SignupSubmitButton from '../../signup-submit-button';
import { submitButtonArgs, SignupFormWrapper, type SubmitButtonStory, WooWrapper } from '../shared';
import type { Meta } from '@storybook/react';
import '../../../../layout/masterbar/woo.scss';

const meta: Meta = {
	title: 'client/blocks/Signup/Submit Button/Brands',
	decorators: [ SignupFormWrapper, WooWrapper ],
	component: SignupSubmitButton,
	args: { ...submitButtonArgs },
};

export default meta;

export const Woo: SubmitButtonStory = {};
