import LinkButton from '../link-button';
import SocialButton from '../social-button';
import OptionsList from './index';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof OptionsList > = {
	title: 'client/blocks/authentication/OptionsList',
	component: OptionsList,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof OptionsList >;

export const TwoSocialButtons: Story = {
	render: () => (
		<OptionsList>
			<SocialButton provider="google">Continue with Google</SocialButton>
			<SocialButton provider="apple">Continue with Apple</SocialButton>
		</OptionsList>
	),
};

export const FourSocialButtons: Story = {
	render: () => (
		<OptionsList>
			<SocialButton provider="google">Continue with Google</SocialButton>
			<SocialButton provider="apple">Continue with Apple</SocialButton>
			<SocialButton provider="github">Continue with GitHub</SocialButton>
			<SocialButton provider="email">Continue with email</SocialButton>
		</OptionsList>
	),
};

export const MixedButtonsAndLink: Story = {
	render: () => (
		<OptionsList>
			<SocialButton provider="google">Continue with Google</SocialButton>
			<SocialButton provider="apple">Continue with Apple</SocialButton>
			<LinkButton href="/log-in/lostpassword">Lost your password?</LinkButton>
		</OptionsList>
	),
};
