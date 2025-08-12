import SignupSubmitButton from '../../signup-submit-button';
import { submitButtonArgs, SignupFormWrapper, type SubmitButtonStory } from '../shared';
import type { Meta } from '@storybook/react';

const meta: Meta = {
	title: 'client/blocks/Signup/Submit Button',
	component: SignupSubmitButton,
	args: { ...submitButtonArgs },
};

export default meta;

export const Default: SubmitButtonStory = { decorators: [ SignupFormWrapper ] };

export const Disabled: SubmitButtonStory = {
	args: {
		isDisabled: true,
	},
	decorators: [ SignupFormWrapper ],
};

export const Busy: SubmitButtonStory = {
	args: {
		isBusy: true,
	},
	decorators: [ SignupFormWrapper ],
};
