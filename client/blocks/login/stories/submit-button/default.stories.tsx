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
	title: 'client/blocks/Login/Submit Button',
	component: LoginSubmitButton,
	args: { ...submitButtonArgs },
};

export default meta;

export const Default: SubmitButtonStory = { decorators: [ LoginFormAction, LoginFormWrapper ] };

export const Disabled: SubmitButtonStory = {
	args: {
		isDisabled: true,
	},
	decorators: [ LoginFormAction, LoginFormWrapper ],
};

export const SendingEmail: SubmitButtonStory = {
	...sendingEmailStory,
	decorators: [ LoginFormAction, LoginFormWrapper ],
};
