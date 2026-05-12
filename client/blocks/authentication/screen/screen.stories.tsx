import Notice from 'calypso/dashboard/components/notice';
import LinkButton from '../link-button';
import PrimaryButton from '../primary-button';
import TextField from '../text-field';
import Screen from './index';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof Screen > = {
	title: 'client/blocks/authentication/Screen',
	component: Screen,
	tags: [ 'autodocs' ],
	parameters: {
		layout: 'fullscreen',
	},
};

export default meta;

type Story = StoryObj< typeof Screen >;

const PlaceholderContent = () => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 16 } }>
		<TextField
			label="Email address or username"
			value=""
			onChange={ () => {} }
			type="text"
			autoComplete="username"
		/>
		<PrimaryButton type="submit">Continue</PrimaryButton>
		<LinkButton href="/log-in/lostpassword">Lost your password?</LinkButton>
	</div>
);

export const Default: Story = {
	args: {
		topBarAction: <LinkButton href="/start">Create an account</LinkButton>,
		heading: 'Log in to WordPress.com',
		subheading: 'By continuing, you agree to our Terms of Service and Privacy Policy.',
		children: <PlaceholderContent />,
	},
};

export const WithNotice: Story = {
	args: {
		topBarAction: <LinkButton href="/start">Create an account</LinkButton>,
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
		topBarAction: <LinkButton href="/log-in">Log in</LinkButton>,
		heading: 'Create your account',
		subheading:
			'By continuing with any of the options listed, you agree to our Terms of Service and Privacy Policy.',
		children: <PlaceholderContent />,
	},
};
