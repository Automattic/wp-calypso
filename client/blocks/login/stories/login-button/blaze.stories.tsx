import LoginButton from '../../login-button';
import {
	BlazeWrapper,
	loginButtonArgs,
	LoginFormAction,
	LoginFormWrapper,
	type Story,
} from '../shared';
import type { Meta } from '@storybook/react';
import '../../../../layout/masterbar/blaze-pro.scss';

const meta: Meta = {
	title: 'client/blocks/Login/Login Button/Blaze Pro',
	decorators: [ LoginFormAction, LoginFormWrapper, BlazeWrapper ],
	component: LoginButton,
	args: { ...loginButtonArgs },
};

export default meta;

export const Default: Story = {};
