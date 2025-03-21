import { Link } from '../';
import type { Meta, StoryObj } from '@storybook/react';
import './style.stories.scss';

const meta: Meta< typeof Link > = {
	title: 'Components/Link',
	component: Link,
};

export default meta;

type Story = StoryObj< typeof Link >;

export const Default: Story = {
	args: {
		to: '/',
		children: 'Home page',
	},
};
