import LoginButton from '../../login-button';
import {
	LoginFormAction,
	LoginFormWrapper,
	type Story,
	JetpackWrapper,
	loginButtonArgs,
} from '../shared';
import type { Meta } from '@storybook/react';
import '../../../../layout/masterbar/oauth-client.scss';

const meta: Meta = {
	title: 'client/blocks/Login/Login Button/Jetpack Cloud',
	decorators: [ LoginFormAction, LoginFormWrapper, JetpackWrapper ],
	component: LoginButton,
	args: { ...loginButtonArgs },
};

export default meta;

export const Default: Story = {};
