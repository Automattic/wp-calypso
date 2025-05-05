import '../../../../layout/masterbar/oauth-client.scss';
import '../../../../jetpack-connect/colors.scss';
import '../../../../login/wp-login/style.scss';

import LoginSubmitButton from '../../login-submit-button';
import {
	LoginFormAction,
	type SubmitButtonStory,
	JetpackLoginWrapper,
	submitButtonArgs,
} from '../shared';
import type { Meta } from '@storybook/react';

const meta: Meta = {
	title: 'client/blocks/Login/Submit Button/Brands',
	component: LoginSubmitButton,
	args: { ...submitButtonArgs, buttonText: 'Continue with email' },
};

export default meta;

export const JetpackLogin: SubmitButtonStory = {
	decorators: [ LoginFormAction, JetpackLoginWrapper ],
};
