import LoginSubmitButton from '../../login-submit-button';
import {
	LoginFormAction,
	LoginFormWrapper,
	type SubmitButtonStory,
	A4AWrapper,
	submitButtonArgs,
} from '../shared';
import type { Meta } from '@storybook/react';
import '../../../../layout/masterbar/oauth-client.scss';

const meta: Meta = {
	title: 'client/blocks/Login/Submit Button/Automattic for Agencies',
	decorators: [ LoginFormAction, LoginFormWrapper, A4AWrapper ],
	component: LoginSubmitButton,
	args: { ...submitButtonArgs },
};

export default meta;

export const Default: SubmitButtonStory = {};
