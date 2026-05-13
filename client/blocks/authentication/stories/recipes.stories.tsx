import { Button, TextControl, __experimentalVStack as VStack } from '@wordpress/components';
import { chevronLeft } from '@wordpress/icons';
import { useState } from 'react';
import CurrentUser from '../current-user';
import Screen from '../screen';
import SocialButton from '../social-button';
import SocialConnectWidget from '../social-connect-widget';
import type { Meta, StoryObj } from '@storybook/react';

import './recipes.scss';

const meta: Meta = {
	title: 'client/blocks/authentication/Recipes',
	tags: [ 'autodocs' ],
	parameters: {
		layout: 'fullscreen',
	},
	// `.wp-brand-font` only applies Recoleta when the parent has `lang` set
	// to a supported language; Storybook's iframe has no lang attribute so
	// the brand font silently falls back to the default serif. Match prod.
	decorators: [
		( Story ) => (
			<div lang="en">
				<Story />
			</div>
		),
	],
};

export default meta;

type Story = StoryObj;

const fullWidth = { width: '100%' };

const LostPasswordRecipe = () => {
	const [ email, setEmail ] = useState( '' );
	return (
		<Screen
			heading="Lost your password?"
			subheading="Enter the email address or username you use to sign in, and we'll send you a reset link."
			backAction={
				<Button variant="link" href="/log-in" icon={ chevronLeft } iconPosition="left">
					Back
				</Button>
			}
		>
			<VStack spacing={ 4 }>
				<TextControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label="Email address or username"
					value={ email }
					onChange={ setEmail }
					type="text"
					autoComplete="username"
				/>
				<Button variant="primary" __next40pxDefaultSize type="submit" style={ fullWidth }>
					Reset my password
				</Button>
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
			topBarAction={
				<Button variant="link" href="/start">
					Create an account
				</Button>
			}
			wide
		>
			<div className="auth-recipe-login">
				<VStack spacing={ 4 } className="auth-recipe-login__input">
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label="Email address or username"
						value={ email }
						onChange={ setEmail }
						type="text"
						autoComplete="username"
					/>
					<Button variant="primary" __next40pxDefaultSize type="submit" style={ fullWidth }>
						Continue
					</Button>
				</VStack>
				<div className="auth-recipe-login__or">
					<span>or</span>
				</div>
				<VStack spacing={ 2 } role="group">
					<SocialButton provider="google">Continue with Google</SocialButton>
					<SocialButton provider="apple">Continue with Apple</SocialButton>
					<SocialButton provider="github">Continue with GitHub</SocialButton>
					<SocialButton provider="email">Continue with email</SocialButton>
				</VStack>
			</div>
		</Screen>
	);
};

const SocialConnectRecipe = () => (
	<Screen
		heading="Connect your account"
		subheading="Connect your WordPress.com account to your Google profile. You will be able to use Google to log in to WordPress.com."
		topBarAction={
			<Button variant="link" href="/log-in">
				Log in
			</Button>
		}
	>
		<VStack spacing={ 4 }>
			<SocialConnectWidget service="google" />
			<Button variant="primary" __next40pxDefaultSize type="button" style={ fullWidth }>
				Connect
			</Button>
		</VStack>
	</Screen>
);

const ContinueAsUserRecipe = () => (
	<Screen
		heading="Log in to WordPress.com"
		topBarAction={
			<Button variant="link" href="/start">
				Create an account
			</Button>
		}
	>
		<VStack spacing={ 4 }>
			<CurrentUser
				avatarUrl="https://gravatar.com/avatar/0?d=mp&s=96"
				name="Jane Doe"
				email="jane@example.com"
			/>
			<Button variant="primary" __next40pxDefaultSize type="button" style={ fullWidth }>
				Continue as Jane Doe
			</Button>
			<Button variant="link" href="#">
				Log in with another account
			</Button>
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
				<TextControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label="6-digit code"
					value={ code }
					onChange={ setCode }
					type="tel"
					autoComplete="one-time-code"
					pattern="[0-9 ]*"
					placeholder="123 456"
				/>
				<Button variant="primary" __next40pxDefaultSize type="submit" style={ fullWidth }>
					Continue
				</Button>
				<Button variant="link" href="#">
					Use a different method
				</Button>
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
