import SignupSubmitButton from '../../signup-submit-button';
import {
	submitButtonArgs,
	type SubmitButtonStory,
	AkismetWrapper,
	SignupFormWrapper,
} from '../shared';
import type { Meta } from '@storybook/react';

const meta: Meta = {
	title: 'client/blocks/Signup/Submit Button/Brands',
	component: SignupSubmitButton,
	args: { ...submitButtonArgs },
};

export default meta;

export const Akismet: SubmitButtonStory = {
	decorators: [ SignupFormWrapper, AkismetWrapper ],
};
