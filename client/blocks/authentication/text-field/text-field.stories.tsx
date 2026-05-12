import { useState } from 'react';
import TextField from './index';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof TextField > = {
	title: 'client/blocks/authentication/TextField',
	component: TextField,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof TextField >;

const Wrapper = ( args: React.ComponentProps< typeof TextField > ) => {
	const [ value, setValue ] = useState( args.value ?? '' );
	return <TextField { ...args } value={ value } onChange={ setValue } />;
};

export const Default: Story = {
	render: ( args ) => <Wrapper { ...args } />,
	args: {
		label: 'Email address or username',
		type: 'email',
		autoComplete: 'username',
	},
};

export const WithHelp: Story = {
	render: ( args ) => <Wrapper { ...args } />,
	args: {
		label: 'Email address',
		type: 'email',
		help: 'We’ll send the reset link to this address.',
	},
};

export const WithError: Story = {
	render: ( args ) => <Wrapper { ...args } />,
	args: {
		label: 'Email address',
		type: 'email',
		value: 'invalid@',
		help: 'Please enter a valid email address.',
		className: 'is-error',
	},
};

export const Password: Story = {
	render: ( args ) => <Wrapper { ...args } />,
	args: {
		label: 'Password',
		type: 'password',
		autoComplete: 'current-password',
	},
};

export const TwoFactorCode: Story = {
	render: ( args ) => <Wrapper { ...args } />,
	args: {
		label: '6-digit code',
		type: 'tel',
		autoComplete: 'one-time-code',
		pattern: '[0-9 ]*',
		placeholder: '123 456',
	},
};

export const Disabled: Story = {
	render: ( args ) => <Wrapper { ...args } />,
	args: {
		label: 'Email address',
		type: 'email',
		value: 'user@example.com',
		disabled: true,
	},
};
