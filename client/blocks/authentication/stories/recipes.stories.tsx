import { __experimentalVStack as VStack } from '@wordpress/components';
import { useState } from 'react';
import { FormDivider } from '../index';
import LinkButton from '../link-button';
import OptionsList from '../options-list';
import PrimaryButton from '../primary-button';
import SocialButton from '../social-button';
import SocialConnectWidget from '../social-connect-widget';
import TextField from '../text-field';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
	title: 'client/blocks/authentication/Recipes',
	tags: [ 'autodocs' ],
	parameters: {
		layout: 'centered',
	},
};

export default meta;

type Story = StoryObj;

const FauxScreen = ( { heading, children }: { heading: string; children: React.ReactNode } ) => (
	<div style={ { inlineSize: 343, padding: 16 } }>
		<VStack spacing={ 6 }>
			<h1 style={ { font: 'var(--wp--preset--font-family--serif, serif) 600 32px/40px' } }>
				{ heading }
			</h1>
			{ children }
		</VStack>
	</div>
);

const LostPasswordRecipe = () => {
	const [ email, setEmail ] = useState( '' );
	return (
		<FauxScreen heading="Lost your password?">
			<VStack spacing={ 4 }>
				<TextField
					label="Email address or username"
					value={ email }
					onChange={ setEmail }
					type="text"
					autoComplete="username"
				/>
				<PrimaryButton type="submit">Reset my password</PrimaryButton>
				<LinkButton href="/log-in">Back to log in</LinkButton>
			</VStack>
		</FauxScreen>
	);
};

const LoginRecipe = () => {
	const [ email, setEmail ] = useState( '' );
	return (
		<FauxScreen heading="Log in to WordPress.com">
			<VStack spacing={ 4 }>
				<OptionsList>
					<SocialButton provider="google">Continue with Google</SocialButton>
					<SocialButton provider="apple">Continue with Apple</SocialButton>
					<SocialButton provider="github">Continue with GitHub</SocialButton>
					<SocialButton provider="email">Continue with email</SocialButton>
				</OptionsList>
				<FormDivider isHorizontal />
				<TextField
					label="Email address or username"
					value={ email }
					onChange={ setEmail }
					type="text"
					autoComplete="username"
				/>
				<PrimaryButton type="submit">Continue</PrimaryButton>
			</VStack>
		</FauxScreen>
	);
};

const SocialConnectRecipe = () => (
	<FauxScreen heading="Connect your account">
		<VStack spacing={ 4 }>
			<p>
				Connect your WordPress.com account to your Google profile. You will be able to use Google to
				log in to WordPress.com.
			</p>
			<SocialConnectWidget service="google" />
			<PrimaryButton type="button">Connect</PrimaryButton>
		</VStack>
	</FauxScreen>
);

const TwoFactorCodeRecipe = () => {
	const [ code, setCode ] = useState( '' );
	return (
		<FauxScreen heading="Two-step authentication">
			<VStack spacing={ 4 }>
				<p>Enter the code from your authenticator app.</p>
				<TextField
					label="6-digit code"
					value={ code }
					onChange={ setCode }
					type="tel"
					autoComplete="one-time-code"
					pattern="[0-9 ]*"
					placeholder="123 456"
				/>
				<PrimaryButton type="submit">Continue</PrimaryButton>
				<LinkButton href="#">Use a different method</LinkButton>
			</VStack>
		</FauxScreen>
	);
};

export const LostPassword: Story = {
	render: () => <LostPasswordRecipe />,
};

export const Login: Story = {
	render: () => <LoginRecipe />,
};

export const SocialConnect: Story = {
	render: () => <SocialConnectRecipe />,
};

export const TwoFactorCode: Story = {
	render: () => <TwoFactorCodeRecipe />,
};
