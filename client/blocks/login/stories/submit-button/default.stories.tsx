import LoginSubmitButton from '../../login-submit-button';
import {
	sendingEmailStory,
	submitButtonArgs,
	LoginFormAction,
	LoginFormWrapper,
	type SubmitButtonStory,
} from '../shared';
import type { Meta } from '@storybook/react';

const meta: Meta = {
	title: 'client/blocks/Login/Submit Button/Default',
	decorators: [ LoginFormAction, LoginFormWrapper ],
	component: LoginSubmitButton,
	args: { ...submitButtonArgs },
};

export default meta;

export const Default: SubmitButtonStory = {};

export const Disabled: SubmitButtonStory = {
	args: {
		isDisabled: true,
	},
};

export const SendingEmail: SubmitButtonStory = { ...sendingEmailStory };
