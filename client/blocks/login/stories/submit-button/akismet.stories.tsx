import LoginSubmitButton from '../../login-submit-button';
import {
	submitButtonArgs,
	LoginFormAction,
	type SubmitButtonStory,
	AkismetWrapper,
	LoginFormWrapper,
} from '../shared';
import type { Meta } from '@storybook/react';

const meta: Meta = {
	title: 'client/blocks/Login/Submit Button/Brands',
	component: LoginSubmitButton,
	args: { ...submitButtonArgs },
};

export default meta;

export const Akismet: SubmitButtonStory = {
	decorators: [ LoginFormAction, LoginFormWrapper, AkismetWrapper ],
};
