import { __experimentalVStack as VStack } from '@wordpress/components';
import { useState } from 'react';
import CurrentUser from '../current-user';
import { FormDivider } from '../index';
import LinkButton from '../link-button';
import OptionsList from '../options-list';
import PrimaryButton from '../primary-button';
import Screen from '../screen';
import SocialButton from '../social-button';
import SocialConnectWidget from '../social-connect-widget';
import TextField from '../text-field';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
	title: 'client/blocks/authentication/Recipes',
	tags: [ 'autodocs' ],
	parameters: {
		layout: 'fullscreen',
	},
};

export default meta;

type Story = StoryObj;

const LostPasswordRecipe = () => {
	const [ email, setEmail ] = useState( '' );
	return (
		<Screen
			heading="Lost your password?"
			subheading="Enter the email address or username you use to sign in, and we'll send you a reset link."
			topBarAction={ <LinkButton href="/log-in">Back to log in</LinkButton> }
		>
			<VStack spacing={ 4 }>
				<TextField
					label="Email address or username"
					value={ email }
					onChange={ setEmail }
					type="text"
					autoComplete="username"
				/>
				<PrimaryButton type="submit">Reset my password</PrimaryButton>
			</VStack>
		</Screen>
	);
};

const LoginRecipe = () => {
	const [ email, setEmail ] = useState( '' );
	return (
		<Screen
			heading="Log in to WordPress.com"
			subheading="By continuing, you agree to our Terms of Service and Privacy Policy."
			topBarAction={ <LinkButton href="/start">Create an account</LinkButton> }
		>
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
		</Screen>
	);
};

const SocialConnectRecipe = () => (
	<Screen
		heading="Connect your account"
		subheading="Connect your WordPress.com account to your Google profile. You will be able to use Google to log in to WordPress.com."
		topBarAction={ <LinkButton href="/log-in">Log in</LinkButton> }
	>
		<VStack spacing={ 4 }>
			<SocialConnectWidget service="google" />
			<PrimaryButton type="button">Connect</PrimaryButton>
		</VStack>
	</Screen>
);

const ContinueAsUserRecipe = () => (
	<Screen
		heading="Log in to WordPress.com"
		topBarAction={ <LinkButton href="/start">Create an account</LinkButton> }
	>
		<VStack spacing={ 4 }>
			<CurrentUser
				avatarUrl="https://gravatar.com/avatar/0?d=mp&s=96"
				name="Jane Doe"
				email="jane@example.com"
			/>
			<PrimaryButton type="button">Continue as Jane Doe</PrimaryButton>
			<LinkButton href="#">Log in with another account</LinkButton>
		</VStack>
	</Screen>
);

const TwoFactorCodeRecipe = () => {
	const [ code, setCode ] = useState( '' );
	return (
		<Screen
			heading="Two-step authentication"
			subheading="Enter the code from your authenticator app."
		>
			<VStack spacing={ 4 }>
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
		</Screen>
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

export const ContinueAsUser: Story = {
	render: () => <ContinueAsUserRecipe />,
};

export const TwoFactorCode: Story = {
	render: () => <TwoFactorCodeRecipe />,
};
