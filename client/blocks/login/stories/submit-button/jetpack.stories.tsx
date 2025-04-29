import LoginSubmitButton from '../../login-submit-button';
import {
	LoginFormAction,
	LoginFormWrapper,
	type SubmitButtonStory,
	JetpackWrapper,
	submitButtonArgs,
} from '../shared';
import type { Meta } from '@storybook/react';
import '../../../../layout/masterbar/oauth-client.scss';

const meta: Meta = {
	title: 'client/blocks/Login/Submit Button/Jetpack Cloud',
	decorators: [ LoginFormAction, LoginFormWrapper, JetpackWrapper ],
	component: LoginSubmitButton,
	args: { ...submitButtonArgs },
};

export default meta;

export const Default: SubmitButtonStory = {};
