import { Button, TextControl, __experimentalVStack as VStack } from '@wordpress/components';
import Notice from 'calypso/dashboard/components/notice';
import SocialButton from '../social-button';
import Screen from './index';
import type { Meta, StoryObj } from '@storybook/react';

import '../stories/recipes.scss';

const meta: Meta< typeof Screen > = {
	title: 'client/blocks/authentication/Screen',
	component: Screen,
	tags: [ 'autodocs' ],
	parameters: {
		layout: 'fullscreen',
	},
	// The `.wp-brand-font` selector only applies Recoleta when the parent has
	// `lang` set to a supported language. Production HTML always has
	// `<html lang="…">`; Storybook's iframe does not, so headings fall back
	// to the default serif. Wrap stories with `lang="en"` to match prod.
	decorators: [
		( Story ) => (
			<div lang="en">
				<Story />
			</div>
		),
	],
};

export default meta;

type Story = StoryObj< typeof Screen >;

const fullWidth = { width: '100%' };

const PlaceholderContent = () => (
	<VStack spacing={ 4 }>
		<TextControl
			__nextHasNoMarginBottom
			__next40pxDefaultSize
			label="Email address or username"
			value=""
			onChange={ () => {} }
			type="text"
			autoComplete="username"
		/>
		<Button variant="primary" __next40pxDefaultSize type="submit" style={ fullWidth }>
			Continue
		</Button>
		<Button variant="link" href="/log-in/lostpassword">
			Lost your password?
		</Button>
	</VStack>
);

export const Default: Story = {
	args: {
		topBarAction: (
			<Button variant="link" href="/start">
				Create an account
			</Button>
		),
		heading: 'Log in to WordPress.com',
		subheading: 'By continuing, you agree to our Terms of Service and Privacy Policy.',
		children: <PlaceholderContent />,
	},
};

export const WithNotice: Story = {
	args: {
		topBarAction: (
			<Button variant="link" href="/start">
				Create an account
			</Button>
		),
		heading: 'Log in to WordPress.com',
		notice: (
			<Notice variant="error">
				We found a WordPress.com account with the email address &quot;jane@example.com&quot;. Log in
				to this account to connect it to your Google profile, or choose a different Google profile.
			</Notice>
		),
		subheading: 'By continuing, you agree to our Terms of Service and Privacy Policy.',
		children: <PlaceholderContent />,
	},
};

export const HeadingOnly: Story = {
	args: {
		heading: 'Two-step authentication',
		children: <PlaceholderContent />,
	},
};

export const SignupAction: Story = {
	args: {
		topBarAction: (
			<Button variant="link" href="/log-in">
				Log in
			</Button>
		),
		heading: 'Create your account',
		subheading:
			'By continuing with any of the options listed, you agree to our Terms of Service and Privacy Policy.',
		children: <PlaceholderContent />,
	},
};

// Demonstrates the `wide` prop with the canonical 2-column content
// arrangement from `auth-desktop-template-2col`. The content row caps at
// 768px so input-CTA + vertical OR + social options fit side-by-side on
// desktop; on mobile the same composition stacks single-column via the
// shared `recipes.scss` grid styles. For a fully composed real-world
// example, see `Recipes / Login`.
const TwoColumnContent = () => (
	<div className="auth-recipe-login">
		<VStack spacing={ 4 } className="auth-recipe-login__input">
			<TextControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				label="Email address or username"
				value=""
				onChange={ () => {} }
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
		<VStack spacing={ 2 } role="group" aria-label="Social login options">
			<SocialButton provider="google">Continue with Google</SocialButton>
			<SocialButton provider="apple">Continue with Apple</SocialButton>
			<SocialButton provider="github">Continue with GitHub</SocialButton>
			<SocialButton provider="email">Continue with email</SocialButton>
		</VStack>
	</div>
);

export const Wide: Story = {
	args: {
		topBarAction: (
			<Button variant="link" href="/start">
				Create an account
			</Button>
		),
		heading: 'Log in to WordPress.com',
		subheading: 'By continuing, you agree to our Terms of Service and Privacy Policy.',
		wide: true,
		children: <TwoColumnContent />,
	},
};
