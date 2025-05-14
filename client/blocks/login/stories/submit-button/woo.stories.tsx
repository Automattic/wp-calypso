import LoginSubmitButton from '../../login-submit-button';
import {
	LoginFormAction,
	LoginFormWrapper,
	type SubmitButtonStory,
	WooWrapper,
	submitButtonArgs,
	sendingEmailStory,
} from '../shared';
import type { Meta } from '@storybook/react';
import '../../../../layout/masterbar/woo.scss';

const meta: Meta = {
	title: 'client/blocks/Login/Submit Button/Brands/Woo',
	decorators: [ LoginFormAction, LoginFormWrapper, WooWrapper ],
	component: LoginSubmitButton,
	args: { ...submitButtonArgs, isWoo: true },
};

export default meta;

export const Default: SubmitButtonStory = {};

export const SendingEmail: SubmitButtonStory = { ...sendingEmailStory };
