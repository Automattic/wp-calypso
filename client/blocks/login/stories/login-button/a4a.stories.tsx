import LoginButton from '../../login-button';
import {
	LoginFormAction,
	LoginFormWrapper,
	type Story,
	A4AWrapper,
	loginButtonArgs,
} from '../shared';
import type { Meta } from '@storybook/react';
import '../../../../layout/masterbar/oauth-client.scss';

const meta: Meta = {
	title: 'client/blocks/Login/Login Button/Automattic for Agencies',
	decorators: [ LoginFormAction, LoginFormWrapper, A4AWrapper ],
	component: LoginButton,
	args: { ...loginButtonArgs },
};

export default meta;

export const Default: Story = {};
