import LoginSubmitButton from '../../login-submit-button';
import {
	submitButtonArgs,
	LoginFormAction,
	WPJobManagerWrapper,
	type SubmitButtonStory,
} from '../shared';
import type { Meta } from '@storybook/react';
import '../../../../login/wp-login/style.scss';

const meta: Meta = {
	title: 'client/blocks/Login/Submit Button/WP Job Manager',
	decorators: [ LoginFormAction, WPJobManagerWrapper ],
	component: LoginSubmitButton,
	args: { ...submitButtonArgs },
};

export default meta;

export const Default: SubmitButtonStory = {};
