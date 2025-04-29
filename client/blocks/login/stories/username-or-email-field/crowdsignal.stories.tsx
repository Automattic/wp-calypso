import LoginUsername from '../../login-username';
import {
	CrowdsignalWrapper,
	LoginFormUserData,
	LoginFormWrapper,
	loginUsernameArgs,
	type LoginUsernameStory,
} from '../shared';
import type { Meta } from '@storybook/react';
import '../../../../layout/masterbar/crowdsignal.scss';

const meta: Meta = {
	title: 'client/blocks/Login/Username or Email/Crowdsignal',
	decorators: [ LoginFormUserData, LoginFormWrapper, CrowdsignalWrapper ],
	component: LoginUsername,
	args: { ...loginUsernameArgs },
};

export default meta;

export const Default: LoginUsernameStory = {};
