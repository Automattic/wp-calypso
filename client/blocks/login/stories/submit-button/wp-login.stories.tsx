// These buttons require the wp-login.scss file to be loaded.
import '../../../../login/wp-login/style.scss';

import LoginSubmitButton from '../../login-submit-button';
import {
	submitButtonArgs,
	LoginFormAction,
	GravatarWrapper,
	WPJobManagerWrapper,
	type SubmitButtonStory,
} from '../shared';
import type { Meta } from '@storybook/react';

const meta: Meta = {
	title: 'client/blocks/Login/Submit Button/Brands',
	component: LoginSubmitButton,
	args: { ...submitButtonArgs },
};

export default meta;

export const Gravatar: SubmitButtonStory = { decorators: [ LoginFormAction, GravatarWrapper ] };

export const WPJobManager: SubmitButtonStory = {
	decorators: [ LoginFormAction, WPJobManagerWrapper ],
};
