// These buttons require the oauth-client.scss file to be loaded.
import '../../../../layout/masterbar/oauth-client.scss';

import LoginSubmitButton from '../../login-submit-button';
import {
	LoginFormAction,
	LoginFormWrapper,
	type SubmitButtonStory,
	A4AWrapper,
	submitButtonArgs,
	JetpackCloudWrapper,
} from '../shared';
import type { Meta } from '@storybook/react';

const meta: Meta = {
	title: 'client/blocks/Login/Submit Button/Brands',
	component: LoginSubmitButton,
	args: { ...submitButtonArgs },
};

export default meta;

export const A4A: SubmitButtonStory = {
	decorators: [ LoginFormAction, LoginFormWrapper, A4AWrapper ],
};

export const JetpackCloud: SubmitButtonStory = {
	decorators: [ LoginFormAction, LoginFormWrapper, JetpackCloudWrapper ],
};
