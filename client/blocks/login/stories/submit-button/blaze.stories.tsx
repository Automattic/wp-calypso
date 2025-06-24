import LoginSubmitButton from '../../login-submit-button';
import {
	BlazeWrapper,
	submitButtonArgs,
	LoginFormAction,
	LoginFormWrapper,
	type SubmitButtonStory,
} from '../shared';
import type { Meta } from '@storybook/react';
import '../../../../layout/masterbar/blaze-pro.scss';

const meta: Meta = {
	title: 'client/blocks/Login/Submit Button/Brands',
	decorators: [ LoginFormAction, LoginFormWrapper, BlazeWrapper ],
	component: LoginSubmitButton,
	args: { ...submitButtonArgs },
};

export default meta;

export const BlazePro: SubmitButtonStory = {};
