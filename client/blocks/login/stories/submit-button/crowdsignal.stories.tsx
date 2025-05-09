import LoginSubmitButton from '../../login-submit-button';
import {
	CrowdsignalWrapper,
	submitButtonArgs,
	LoginFormAction,
	LoginFormWrapper,
	type SubmitButtonStory,
} from '../shared';
import type { Meta } from '@storybook/react';
import '../../../../layout/masterbar/crowdsignal.scss';

const meta: Meta = {
	title: 'client/blocks/Login/Submit Button/Brands',
	decorators: [ LoginFormAction, LoginFormWrapper, CrowdsignalWrapper ],
	component: LoginSubmitButton,
	args: { ...submitButtonArgs },
};

export default meta;

export const Crowdsignal: SubmitButtonStory = {};
