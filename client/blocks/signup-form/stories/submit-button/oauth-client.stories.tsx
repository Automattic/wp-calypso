// These buttons require the oauth-client.scss file to be loaded.
import '../../../../layout/masterbar/oauth-client.scss';

import SignupSubmitButton from '../../signup-submit-button';
import {
	type SubmitButtonStory,
	A4AWrapper,
	submitButtonArgs,
	JetpackWrapper,
	SignupFormWrapper,
} from '../shared';
import type { Meta } from '@storybook/react';

const meta: Meta = {
	title: 'client/blocks/Signup/Submit Button/Brands',
	component: SignupSubmitButton,
	args: { ...submitButtonArgs, children: 'Create your account' },
};

export default meta;

export const A4A: SubmitButtonStory = {
	decorators: [ SignupFormWrapper, A4AWrapper ],
};

export const JetpackCloud: SubmitButtonStory = {
	decorators: [ SignupFormWrapper, JetpackWrapper ],
};
