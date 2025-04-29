import LoginSubmitButton from '../../login-submit-button';
import {
	AkismetWrapper,
	submitButtonArgs,
	LoginFormAction,
	type SubmitButtonStory,
} from '../shared';
import type { Meta } from '@storybook/react';

const meta: Meta = {
	title: 'client/blocks/Login/Submit Button/Akismet',
	decorators: [ LoginFormAction, AkismetWrapper ],
	component: LoginSubmitButton,
	args: { ...submitButtonArgs },
};

export default meta;

export const Default: SubmitButtonStory = {};
